// Nearest-token lookup: when the gate finds a raw colour, it names the
// closest token in the contract so the fix is one substitution away.
//
// The suggestion is only worth making if it is RIGHT. A wrong "nearest token"
// is worse than none — it tells the agent to fix a colour with, say, a
// font-weight token, and the whole point of undrift is that its messages can
// be trusted. So this module is deliberately conservative in two places:
// what may enter the index, and how far a match may be before we stay quiet.
import { parse, differenceCiede2000, colorsNamed } from "culori";

const diff = differenceCiede2000();

// #rgb, #rgba, #rrggbb, #rrggbbaa — a LEADING # is required.
const HEX_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// The CSS colour functions. `color-mix` and `color` are included: they are
// unambiguously colours even when culori can't resolve them to a value.
const COLOR_FN_RE = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/i;

// `light-dark(A, B)` wraps the whole value; capture everything between the
// outer parens and split it ourselves.
const LIGHT_DARK_RE = /^light-dark\s*\(([\s\S]*)\)\s*$/i;

// Guard against pathological nesting; two levels is already unheard of.
const MAX_LIGHT_DARK_DEPTH = 8;

/**
 * Split a CSS argument list on its TOP-LEVEL commas. Splitting on the first
 * comma would cut `light-dark(rgba(5, 54, 89, .1), …)` in half and lose the
 * colour, so track paren depth instead.
 */
function splitTopLevel(args) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < args.length; i++) {
    const ch = args[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(args.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(args.slice(start));
  return parts;
}

/**
 * Reduce a token value to the single colour we should measure against.
 *
 * Today that means unwrapping `light-dark(A, B)` to A: it is valid modern CSS
 * that culori cannot resolve, and some design systems declare every single
 * colour that way, leaving their whole palette invisible to the matcher. A is
 * the light-mode value, the sensible default for a single index.
 *
 * Anything else is returned trimmed and unchanged; an unresolvable inner value
 * (`light-dark(var(--x), …)`) simply fails the colour checks downstream and
 * the token is skipped, exactly as before.
 */
export function resolveColorValue(value) {
  if (typeof value !== "string") return "";
  let v = value.trim();
  for (let depth = 0; depth < MAX_LIGHT_DARK_DEPTH; depth++) {
    const m = LIGHT_DARK_RE.exec(v);
    if (!m) break;
    v = splitTopLevel(m[1])[0].trim();
  }
  return v;
}

/**
 * Is this token value unambiguously a colour?
 *
 * Never infer this from culori's parser: culori is permissive by design and
 * reads the bare string "700" as the 3-digit hex #700, so `--font-weight-bold:
 * 700` looked like dark red. Decide from the SYNTAX first, parse second.
 *
 * Keywords with no chromatic position (`transparent`, `currentColor`) are
 * excluded on purpose — they are colour-valued, but "nearest to transparent"
 * is not a suggestion any agent can act on.
 */
export function isColorValue(value) {
  if (typeof value !== "string") return false;
  const v = resolveColorValue(value);
  if (!v) return false;
  if (HEX_RE.test(v)) return true;
  if (COLOR_FN_RE.test(v)) return true;
  return Object.prototype.hasOwnProperty.call(colorsNamed, v.toLowerCase());
}

/**
 * Above this CIEDE2000 distance, the "nearest" token is not a neighbour, it's
 * just the least-bad row in the table — suggesting it is noise. CIEDE2000 is
 * calibrated so ~1 is a just-noticeable difference and ~10 is plainly a
 * different colour; 30 is a different hue family altogether (pure green to
 * mid-slate measures ~34). Set here rather than lower so that legitimately
 * sparse palettes still get a usable pointer, while a system whose colours
 * undrift cannot resolve gets silence instead of a wrong answer.
 */
export const MAX_SUGGESTION_DISTANCE = 30;

/**
 * Build a matcher over the contract's colour tokens (name → parsed colour).
 * `light-dark()` values are resolved to their light-mode argument first (see
 * `resolveColorValue`). Values that remain unresolvable (`var()`,
 * `color-mix()`) are skipped: there is nothing to measure a distance against.
 * An empty index is a normal outcome, not a failure.
 */
export function tokenColorIndex(tokens) {
  const index = [];
  for (const [name, value] of Object.entries(tokens)) {
    if (!isColorValue(value)) continue;
    const parsed = parse(resolveColorValue(value));
    if (parsed) index.push({ name, parsed });
  }
  return index;
}

/**
 * Return { name, distance } of the nearest token colour, or null when there is
 * no trustworthy answer — an empty index, an unparseable input, or a nearest
 * match beyond MAX_SUGGESTION_DISTANCE. Callers must handle null by falling
 * back to generic advice (see `suggestColor` in gate.mjs).
 */
export function nearestToken(index, rawColor) {
  if (!isColorValue(rawColor)) return null;
  // culori.parse THROWS on some malformed modern-syntax colours (e.g. certain
  // oklch() forms) rather than returning null. The docstring promises null for
  // "an unparseable input", and a colour suggestion must never crash a scan of
  // a stranger's repo — OKLCH is exactly what the best modern systems use.
  // Surfaced 2026-07-23 by a real OKLCH codebase (clarity-v2).
  let parsed;
  try {
    parsed = parse(resolveColorValue(rawColor));
  } catch {
    return null;
  }
  if (!parsed || index.length === 0) return null;
  let best = null;
  for (const t of index) {
    const d = diff(parsed, t.parsed);
    if (best === null || d < best.distance) best = { name: t.name, distance: d };
  }
  return best && best.distance <= MAX_SUGGESTION_DISTANCE ? best : null;
}
