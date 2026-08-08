/**
 * Token build script.
 * Reads DTCG source files, validates, and emits CSS / JS / JSON outputs.
 *
 * Usage: node build.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRefs } from "./lib/resolve.mjs";
import { flattenPrimitives, flattenSemantics, renderBlock } from "./lib/emit.mjs";
import { dtcgToCss } from "./lib/color.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "src");
const distDir = join(__dirname, "dist");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    throw new Error(`Failed to read/parse ${filePath}: ${e.message}`);
  }
}

function isNonEmpty(obj) {
  return obj != null && typeof obj === "object" && Object.keys(obj).length > 0;
}

/** Absolute paths of every primitive layer file (src/primitive/*.tokens.json), sorted. */
function primitiveFiles() {
  const dir = join(srcDir, "primitive");
  return readdirSync(dir)
    .filter(f => f.endsWith(".tokens.json"))
    .sort()
    .map(f => join(dir, f));
}

/** Deep-merge objects (right wins) */
function merge(...objects) {
  const result = {};
  for (const obj of objects) {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === "object" && !Array.isArray(v) && !("$value" in v)) {
        result[k] = merge(result[k] ?? {}, v);
      } else {
        result[k] = v;
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Validate: check every $value is well-formed; check refs resolve
// ---------------------------------------------------------------------------

function validateTree(tree, filePath) {
  function walk(node, path) {
    if (node == null || typeof node !== "object") return;
    if ("$value" in node) {
      if (node.$value === undefined || node.$value === null) {
        throw new Error(`[${filePath}] token "${path}" has missing/null $value`);
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      walk(v, path ? `${path}.${k}` : k);
    }
  }
  walk(tree, "");
}

function validate(primitiveTree, themeDir) {
  // Validate each primitive file
  const primFiles = primitiveFiles();
  for (const f of primFiles) {
    const tree = readJson(f);
    validateTree(tree, f);
  }

  // Validate primitive refs can be resolved internally (no cross-refs expected but catches cycles)
  try {
    resolveRefs(primitiveTree);
  } catch (e) {
    throw new Error(`[src/primitive/*.tokens.json] ${e.message}`);
  }

  // Validate each theme file
  const themes = readdirSync(themeDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const theme of themes) {
    const lightPath = join(themeDir, theme, "light.tokens.json");
    const darkPath = join(themeDir, theme, "dark.tokens.json");
    const light = existsSync(lightPath) ? readJson(lightPath) : {};
    const dark = existsSync(darkPath) ? readJson(darkPath) : {};

    if (!isNonEmpty(light)) continue; // skip empty themes

    validateTree(light, lightPath);
    validateTree(dark, darkPath);

    // Validate every semantic ref points at an existing primitive.
    // flattenSemantics throws a file-attributed message naming the bad ref.
    flattenSemantics(light, primitiveTree, lightPath);
    if (isNonEmpty(dark)) {
      flattenSemantics(dark, primitiveTree, darkPath);
    }

    // Also run resolveRefs to catch circular refs, attributed to the theme file.
    try {
      resolveRefs(merge(primitiveTree, light));
      if (isNonEmpty(dark)) resolveRefs(merge(primitiveTree, dark));
    } catch (e) {
      throw new Error(`[src/theme/${theme}/*.tokens.json] ${e.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------

function build() {
  // 1. Load primitives — every *.tokens.json in src/primitive/ is a primitive
  //    layer (color, dimension, type, shadow, …); the set is discovered, not
  //    hardcoded, so adding a primitive file needs no build edit.
  const primitiveTree = merge(...primitiveFiles().map(readJson));

  const themeDir = join(srcDir, "theme");

  // 2. Validate
  validate(primitiveTree, themeDir);

  // 3. Flatten primitives → :root block
  const primVars = flattenPrimitives(primitiveTree);
  let css = `:root {\n${renderBlock(primVars)}}\n`;

  // 4. Collect all resolved tokens for JS/JSON output
  const allResolved = resolveRefs(primitiveTree);

  // 5. For each theme, emit [data-theme] scopes
  const themes = readdirSync(themeDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  for (const theme of themes) {
    const lightPath = join(themeDir, theme, "light.tokens.json");
    const darkPath = join(themeDir, theme, "dark.tokens.json");
    const light = existsSync(lightPath) ? readJson(lightPath) : {};
    const dark = existsSync(darkPath) ? readJson(darkPath) : {};

    if (!isNonEmpty(light)) continue; // skip empty themes (no phantom scopes)

    // Emit light scope
    const lightVars = flattenSemantics(light, primitiveTree, lightPath);
    css += `\n[data-theme="${theme}"] {\n${renderBlock(lightVars)}}\n`;

    // Emit dark scope (if non-empty)
    if (isNonEmpty(dark)) {
      const darkVars = flattenSemantics(dark, primitiveTree, darkPath);
      css += `\n[data-theme="${theme}"].dark {\n${renderBlock(darkVars)}}\n`;
    }
  }

  // 6. Flatten everything resolved for JS/JSON
  function flattenResolved(tree) {
    const out = {};
    function walk(node, path) {
      if (node == null || typeof node !== "object") return;
      if ("$value" in node) {
        const key = "--" + path.join("-");
        const v = node.$value;
        if (v && typeof v === "object" && !Array.isArray(v) && v.colorSpace) {
          // Colour object → CSS string (matches the CSS output)
          out[key] = dtcgToCss(v);
        } else if (Array.isArray(v)) {
          out[key] = v.join(", ");
        } else {
          out[key] = String(v);
        }
        return;
      }
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith("$")) continue;
        walk(v, [...path, k]);
      }
    }
    walk(tree, []);
    return out;
  }

  const flatTokens = flattenResolved(allResolved);

  // 7. Write outputs
  mkdirSync(join(distDir, "web"), { recursive: true });
  mkdirSync(join(distDir, "js"), { recursive: true });
  mkdirSync(join(distDir, "json"), { recursive: true });

  writeFileSync(join(distDir, "web", "tokens.css"), css, "utf8");

  // JS: default export object
  const jsContent = `// Auto-generated by build.mjs — do not edit\nexport default ${JSON.stringify(flatTokens, null, 2)};\n`;
  writeFileSync(join(distDir, "js", "tokens.js"), jsContent, "utf8");

  // TS declaration
  const tsContent = `// Auto-generated by build.mjs — do not edit\ndeclare const tokens: Record<string, string>;\nexport default tokens;\n`;
  writeFileSync(join(distDir, "js", "tokens.d.ts"), tsContent, "utf8");

  // JSON
  writeFileSync(join(distDir, "json", "tokens.json"), JSON.stringify(flatTokens, null, 2) + "\n", "utf8");

  console.log("Token build complete");
}

build();
