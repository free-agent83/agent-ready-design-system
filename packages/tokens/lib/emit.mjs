/**
 * Token emission helpers.
 * Flattens a DTCG token tree to CSS custom property maps.
 */

import { dtcgToCss } from "./color.mjs";

const REF_RE = /^\{([^}]+)\}$/;

/**
 * Walk a token tree, calling `cb(path[], node)` for every leaf node that has $value.
 * Skips keys starting with "$".
 */
function walk(node, path, cb) {
  if (node == null || typeof node !== "object") return;
  if ("$value" in node) {
    cb(path, node);
    return;
  }
  for (const key of Object.keys(node)) {
    if (key.startsWith("$")) continue;
    walk(node[key], [...path, key], cb);
  }
}

/**
 * Convert a path array to a CSS custom property name.
 * e.g. ["color","primitive","neutral","900"] → "--color-primitive-neutral-900"
 */
function toVarName(path) {
  return "--" + path.join("-");
}

/**
 * Flatten a PRIMITIVES token tree to { "--var-name": "literal-value" }.
 * Colours (object $value) → dtcgToCss(); dimensions/type/numbers → raw string.
 */
export function flattenPrimitives(tree) {
  const result = {};
  walk(tree, [], (path, node) => {
    const v = node.$value;
    if (typeof v === "object" && v !== null && !Array.isArray(v) && v.colorSpace) {
      // OKLCH colour object
      result[toVarName(path)] = dtcgToCss(v);
    } else if (Array.isArray(v)) {
      // Font family array — join as comma-separated string
      result[toVarName(path)] = v.join(", ");
    } else {
      // Dimension string or number
      result[toVarName(path)] = String(v);
    }
  });
  return result;
}

/**
 * Flatten a SEMANTICS token tree to { "--var-name": "var(--ref-var-name)" }.
 * The $value MUST be a {ref} string. Validates the ref path exists in primitiveTree.
 * Throws with a clear message if a ref points to a non-existent primitive.
 *
 * @param {object} semanticTree  - the semantic token tree
 * @param {object} primitiveTree - the combined primitive tree (for validation)
 * @param {string} sourceFile    - label for error messages
 */
export function flattenSemantics(semanticTree, primitiveTree, sourceFile) {
  const result = {};
  walk(semanticTree, [], (path, node) => {
    const v = node.$value;
    if (typeof v !== "string") {
      throw new Error(`[${sourceFile}] token "${path.join(".")}" has non-reference $value: ${JSON.stringify(v)}`);
    }
    const match = v.match(REF_RE);
    if (!match) {
      throw new Error(`[${sourceFile}] token "${path.join(".")}" $value is not a {ref}: ${v}`);
    }
    const refPath = match[1]; // e.g. "color.primitive.white"
    // Validate the ref exists in the primitive tree
    const parts = refPath.split(".");
    let node2 = primitiveTree;
    for (const part of parts) {
      if (node2 == null || typeof node2 !== "object") {
        throw new Error(`[${sourceFile}] missing reference: ${refPath} (in token "${path.join(".")}")`);
      }
      node2 = node2[part];
    }
    if (node2 == null || !("$value" in node2)) {
      throw new Error(`[${sourceFile}] missing reference: ${refPath} (in token "${path.join(".")}")`);
    }
    // Emit as var() pointing to the primitive's CSS var
    const refVarName = "--" + refPath.replace(/\./g, "-");
    result[toVarName(path)] = `var(${refVarName})`;
  });
  return result;
}

/**
 * Render a flat { "--name": "value" } map into CSS block body lines.
 * Returns a string like "  --name: value;\n  --name2: value2;\n"
 */
export function renderBlock(map) {
  return Object.entries(map)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n") + "\n";
}
