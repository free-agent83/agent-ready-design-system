// Loads the "contract" — the design system's own artifacts (tokens, catalog,
// rule config) normalized into the object every undrift command consumes.
// The contract is derived from the system, never hand-authored twice.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { readCssTokens } from "./readers/css-tokens.mjs";
import { resolvePackageComponents } from "./readers/package-components.mjs";

const DEFAULT_CONFIG_NAME = "undrift.config.json";

/** Walk up from `start` until a undrift.config.json is found. */
export function findConfig(start) {
  let dir = resolve(start);
  for (;;) {
    const candidate = resolve(dir, DEFAULT_CONFIG_NAME);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Parse CATALOG.md's tables into [{ name, status, for, notFor, tier }].
 * The catalog is the agent's index; undrift reuses it verbatim so the
 * gate's suggestions always match what the docs say.
 */
export function parseCatalog(markdown) {
  const rows = [];
  let tier = null;
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) tier = heading[1].trim().toLowerCase();
    const cells = line.match(/^\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|$/);
    if (!cells) continue;
    const name = cells[1].trim();
    if (name === "Component" || /^-+$/.test(name)) continue;
    rows.push({
      name,
      status: cells[2].trim(),
      for: cells[3].trim(),
      notFor: cells[4].trim(),
      tier,
    });
  }
  return rows;
}

/**
 * Load a contract from a config path (or a directory containing one).
 * Missing artifacts degrade gracefully — a foreign repo without tokens
 * still gets the raw-value rules; it just loses nearest-token suggestions.
 */
export function loadContract(configPath) {
  const path = configPath.endsWith(".json") ? configPath : findConfig(configPath);
  if (!path || !existsSync(path)) {
    throw new Error(
      `No ${DEFAULT_CONFIG_NAME} found at or above "${configPath}". Run undrift from a configured repo, or pass --config.`
    );
  }
  const root = dirname(path);
  const config = JSON.parse(readFileSync(path, "utf8"));

  const read = (rel) => {
    if (!rel) return null;
    const abs = resolve(root, rel);
    return existsSync(abs) ? readFileSync(abs, "utf8") : null;
  };

  const tokensJson = read(config.tokens);
  const catalogMd = read(config.catalog);
  const componentsEntry = config.componentsFrom
    ? resolve(root, config.componentsFrom)
    : null;

  // Token sources are ADDITIVE, never either/or. A design system legitimately
  // declares tokens in several places at once — the sample ships a DTCG JSON
  // build *and* a Tailwind v4 `@theme inline` alias layer, and code uses both.
  // Letting one shadow the other makes real, working tokens look non-existent
  // to no-unknown-tokens. Any Tailwind v4 repo has this shape.
  //
  // Merge order — LATER SOURCES WIN on key collision:
  //   1. DTCG JSON (`tokens`)
  //   2. each `tokensCss` entry, in the order configured
  // So the alias/theme layer listed last overrides the generated build, which
  // is what you want: the last thing the browser sees is the value that applies.
  //
  // Missing files degrade gracefully — they are skipped, never thrown on — so a
  // partially-built repo still gates on whatever token sources do exist.
  const tokensCssList = config.tokensCss
    ? (Array.isArray(config.tokensCss) ? config.tokensCss : [config.tokensCss])
    : [];
  const tokensCssPaths = tokensCssList
    .map((rel) => resolve(root, rel))
    .filter((abs) => existsSync(abs));

  const tokens = tokensJson ? JSON.parse(tokensJson) : {};
  for (const abs of tokensCssPaths) {
    Object.assign(tokens, readCssTokens(readFileSync(abs, "utf8")));
  }

  // Catalog: CATALOG.md (rich — carries for/not-for) if present, else the
  // package's own exports resolved TRANSITIVELY (a flat parse hides compound
  // parts like TableRow and makes correct code look wrong).
  const catalog = catalogMd
    ? parseCatalog(catalogMd).map((r) => ({ ...r, source: "catalog" }))
    : componentsEntry && existsSync(componentsEntry)
      ? resolvePackageComponents(componentsEntry).map((name) => ({
          name, status: "unknown", for: null, notFor: null, tier: null, source: "package",
        }))
      : [];

  // Only assert component existence when the list is known-complete. A catalog
  // resolved from a package is authoritative; a hand-written CATALOG.md may
  // legitimately omit compound parts, so the rule must not fire against it.
  const catalogComplete = !catalogMd && catalog.length > 0;

  return {
    root,
    configPath: path,
    system: config.system ?? null,
    tokens,
    tokensCssPaths,
    // Kept for the single-stylesheet consumers (audit.mjs, demo/server.mjs):
    // the first resolved source, or null if none exist on disk.
    tokensCssPath: tokensCssPaths[0] ?? null,
    catalog,
    catalogComplete,
    componentsFromPath: componentsEntry,
    systemImports: config.systemImports ?? (config.system ? [config.system] : []),
    catalogPath: config.catalog ? resolve(root, config.catalog) : null,
    componentsRoot: config.componentsRoot ? resolve(root, config.componentsRoot) : null,
    exemptMarker: config.exemptMarker ?? "token-exempt",
    intrinsics: config.intrinsics ?? {},
    foreignUi: config.foreignUi ?? [],
    profiles: config.profiles ?? {},
  };
}
