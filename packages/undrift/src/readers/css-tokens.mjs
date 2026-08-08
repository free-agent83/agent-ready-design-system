// packages/undrift/src/readers/css-tokens.mjs
// Extracts CSS custom properties from any stylesheet. Format-generic:
// works on formatted or minified CSS, from any design system. This is why
// undrift needs no per-system adapters.

// --name : value   (value ends at ; or } — the first that isn't inside parens)
const DECL_RE = /(--[A-Za-z0-9_-]+)\s*:\s*([^;}]+)/g;

/** @returns {Record<string,string>} token name → declared value (last wins) */
export function readCssTokens(css) {
  const tokens = {};
  for (const m of css.matchAll(DECL_RE)) {
    tokens[m[1]] = m[2].trim();
  }
  return tokens;
}
