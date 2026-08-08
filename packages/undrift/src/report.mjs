// packages/undrift/src/report.mjs
// Output written for an agent's turn, not a CI log. Silence is the default
// (spec P5): violations self-correct without commentary, gaps get one notice,
// triage only on request.

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * One line. The whole turn's report when nothing needs a human.
 *
 * Two things this line refuses to lie about:
 *
 * 1. **Exemptions.** An exemption is an invisible violation — "0 violations,
 *    14 exemptions" is not a clean run — so the count is always surfaced.
 * 2. **Gaps under --strict.** Strict promotes every valid gap to an
 *    `unresolved-gap` violation, so `violations` already contains them.
 *    Printing both counts would report one item twice ("✗ 1 violation ·
 *    1 gap"). Strict therefore names what actually blocks the release —
 *    the unresolved gaps — and counts the remaining violations separately.
 */
export function statusLine({
  declarations = 0, violations = 0, gaps = 0, exemptions = 0, strict = false, system,
} = {}) {
  // Under strict, `gaps` of the violations are gap promotions; don't re-count them.
  const gapViolations = strict ? Math.min(gaps, violations) : 0;
  const other = violations - gapViolations;

  const head =
    other > 0 ? `✗ ${plural(other, "violation")}`
    : gapViolations > 0 ? `✗ ${plural(gapViolations, "unresolved gap")}`
    : "✓ on-system";

  const parts = [head];
  if (other > 0 && gapViolations > 0) parts.push(plural(gapViolations, "unresolved gap"));
  parts.push(plural(declarations, "declaration"));
  if (!strict && gaps > 0) parts.push(plural(gaps, "gap"));
  if (exemptions > 0) parts.push(plural(exemptions, "exemption"));
  if (system) parts.push(system);
  return parts.join(" · ");
}

/**
 * A gap notice. Three parts, always:
 *   1. what is missing
 *   2. why the system cannot serve it
 *   3. why it was needed  ← only the agent knows this
 */
export function gapNotice({ what, reason, need, placed = true }) {
  const lines = [`⚠ Gap: ${what}`, `  ${reason}`];
  if (need) lines.push(`  ${need}`);
  if (placed) lines.push(`  Placed a gap marker; the rest of this screen is on-system.`);
  return lines.join("\n");
}
