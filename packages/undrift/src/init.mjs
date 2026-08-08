// packages/undrift/src/init.mjs
// `undrift init <package>` — onboarding is ~10 lines of config, not custom code.
// Everything here is sniffed from what the design system already publishes:
// its type declarations (the component list) and its stylesheet (the tokens).
// No per-system adapters, no hand-authored inventory.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import { resolvePackageComponents } from "./readers/package-components.mjs";

export const CONFIG_FILE = "undrift.config.json";
export const PLACEHOLDER_PATH = "components/undrift-missing.tsx";

const TEMPLATE = fileURLToPath(new URL("../templates/missing.tsx", import.meta.url));

/** The seven rules a freshly-initialised repo gates on. */
export const DEFAULT_RULES = [
  "no-raw-colors",
  "no-arbitrary-values",
  "no-raw-elements",
  "no-foreign-ui-imports",
  "no-inline-style-values",
  "no-unknown-tokens",
  "no-unknown-components",
];

/**
 * The globs an agent's output actually lands in. Getting this wrong is the
 * quiet failure mode: a profile that matches nothing makes the hook take its
 * "no rules for this file" path and never fire, and the repo then reads as
 * clean for entirely the wrong reason. Cover Vite (`src/`) and Next (`app/`).
 *
 * The placeholder is excluded from its own rules — undrift-missing.tsx
 * legitimately hardcodes the magenta hatching, and gating it would make every
 * repo fail on the one file undrift itself installed.
 */
export const DEFAULT_INCLUDE = [
  "src/**/*.{ts,tsx,jsx}",
  "app/**/*.{ts,tsx,jsx}",
  "components/**/*.{ts,tsx,jsx}",
  "!**/undrift-missing.*",
  "!**/*.{test,spec,stories}.*",
  "!**/node_modules/**",
];

export const FOREIGN_UI = [
  "@mui/",
  "@chakra-ui/",
  "antd",
  "@mantine/",
  "react-bootstrap",
  "@nextui-org/",
];

// Intrinsic elements a design system almost always replaces, with the names
// those replacements most commonly carry. Only a candidate that is genuinely in
// the resolved catalog is used, so a system without a Select never gets told to
// use one. A tag with no match stays in the map with a null value: the raw
// element is still banned, but the message says "propose a component" rather
// than naming something that does not exist.
const INTRINSIC_CANDIDATES = {
  button: ["Button"],
  input: ["Input", "TextInput", "TextField"],
  select: ["Select", "Selector", "SelectInput", "Dropdown"],
  textarea: ["Textarea", "TextArea", "TextAreaInput"],
};

const toPosix = (p) => p.split(sep).join("/");

/** Path a package resolves to inside this repo's node_modules. */
function packageDir(root, pkgName) {
  const dir = resolve(root, "node_modules", pkgName);
  return existsSync(dir) ? dir : null;
}

/** The package's own declared type entry, or the conventional fallbacks. */
function findTypesEntry(pkgDir, manifest) {
  const declared = [
    manifest.types,
    manifest.typings,
    manifest.exports?.["."]?.types,
    "dist/index.d.ts",
    "index.d.ts",
  ].filter((v) => typeof v === "string");

  for (const rel of declared) {
    const abs = resolve(pkgDir, rel);
    if (existsSync(abs) && abs.endsWith(".d.ts")) return abs;
  }
  return null;
}

/**
 * The stylesheet carrying the custom properties. Design systems ship one big
 * built CSS file plus assorted small ones (resets, theme fragments), so the
 * largest wins — the token layer is always the substantial one.
 */
function findTokensCss(pkgDir, typesEntry) {
  const search = (cwd) =>
    fg
      .sync("**/*.css", { cwd, absolute: true, ignore: ["**/node_modules/**"] })
      .map((file) => ({ file, size: statSync(file).size }))
      .sort((a, b) => b.size - a.size || a.file.localeCompare(b.file));

  // Prefer the built output directory the types entry lives in, then the
  // whole package — a reset.css at the package root must never outrank it.
  const dirs = [typesEntry ? dirname(typesEntry) : null, pkgDir].filter(Boolean);
  for (const dir of dirs) {
    const hit = search(dir)[0];
    if (hit) return hit.file;
  }
  return null;
}

/**
 * Sniff an installed design system: where its component declarations live,
 * where its tokens live, and which intrinsic elements it can replace.
 * @returns {{system:string, componentsFrom:string|null, tokensCss:string|null,
 *            components:string[], intrinsics:Record<string,string|null>,
 *            packageDir:string}}
 */
export function detectSystem(root, pkgName) {
  const pkgDir = packageDir(root, pkgName);
  if (!pkgDir) {
    throw new Error(
      `${pkgName} is not installed in ${root}. Install the design system first, then run undrift init.`
    );
  }

  const manifestPath = resolve(pkgDir, "package.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : {};

  const typesEntry = findTypesEntry(pkgDir, manifest);
  const tokensCss = findTokensCss(pkgDir, typesEntry);
  const components = typesEntry ? resolvePackageComponents(typesEntry) : [];

  const known = new Set(components);
  const intrinsics = {};
  for (const [tag, candidates] of Object.entries(INTRINSIC_CANDIDATES)) {
    intrinsics[tag] = candidates.find((name) => known.has(name)) ?? null;
  }

  return {
    system: pkgName,
    packageDir: pkgDir,
    componentsFrom: typesEntry ? toPosix(relative(root, typesEntry)) : null,
    tokensCss: tokensCss ? toPosix(relative(root, tokensCss)) : null,
    components,
    intrinsics,
  };
}

/** The exact config shape a fresh repo gets. */
export function buildConfig(found) {
  return {
    // Resolved against the consumer's own node_modules — a monorepo-relative
    // path here would be a dead reference in every generated client config.
    $schema: "./node_modules/undrift/schema.json",
    system: found.system,
    tokensCss: found.tokensCss,
    componentsFrom: found.componentsFrom,
    systemImports: [found.system],
    exemptMarker: "token-exempt",
    intrinsics: found.intrinsics,
    foreignUi: FOREIGN_UI,
    profiles: {
      app: {
        include: DEFAULT_INCLUDE,
        rules: DEFAULT_RULES,
      },
    },
  };
}

/**
 * Write the config and copy the `Missing` placeholder into the repo (shadcn
 * model — the consumer owns the file, undrift never imports it).
 * Existing files are left alone unless `force`, so re-running init is safe.
 */
export function runInit(root, pkgName, { force = false } = {}) {
  const found = detectSystem(root, pkgName);
  const config = buildConfig(found);

  const configPath = resolve(root, CONFIG_FILE);
  const configExisted = existsSync(configPath);
  if (!configExisted || force) {
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  }

  const placeholderPath = resolve(root, PLACEHOLDER_PATH);
  const placeholderExisted = existsSync(placeholderPath);
  if (!placeholderExisted || force) {
    mkdirSync(dirname(placeholderPath), { recursive: true });
    copyFileSync(TEMPLATE, placeholderPath);
  }

  return {
    ...found,
    config,
    configPath,
    placeholderPath,
    wroteConfig: !configExisted || force,
    wrotePlaceholder: !placeholderExisted || force,
  };
}
