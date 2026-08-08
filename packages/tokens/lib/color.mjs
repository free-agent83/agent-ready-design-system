import { formatHex } from "culori";

/**
 * Convert a DTCG structured OKLCH $value object to a CSS oklch() string.
 * Pass-through for plain strings.
 * @param {object|string} value
 * @returns {string}
 */
export function dtcgToCss(value) {
  if (typeof value === "string") return value;
  const { colorSpace, components } = value;
  if (!Array.isArray(components) || components.length !== 3) {
    throw new Error("invalid oklch components: " + JSON.stringify(value));
  }
  const [l, c, h] = components;
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Return a hex string for a DTCG structured OKLCH $value object.
 * Uses the `hex` field if present; otherwise derives it via culori.
 * Pass-through for plain strings.
 * @param {object|string} value
 * @returns {string}
 */
export function toHex(value) {
  if (typeof value === "string") return value;
  if (value.hex) return value.hex;
  const [l, c, h] = value.components;
  return formatHex({ mode: "oklch", l, c, h });
}
