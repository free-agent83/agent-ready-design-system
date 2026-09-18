import { type MissingProps } from "./missing";

// Missing has no variant axis, so the soundness property to prove is the
// one that's actually true here: `what` and `reason` are both mandatory,
// and the props that would let a caller undo the loudness (`style`,
// `role`, `aria-label`, `children`) are not accepted at all. Every line
// below is evaluated by `tsc --noEmit` (no vitest runtime needed).

// 1) a legal declaration compiles.
const valid: MissingProps = {
  what: "DateRangePicker",
  reason: "single-date Calendar only, no range variant exists",
};
void valid;

// 2) @ts-expect-error: a gap declared with no `reason` is not legal. An
// unexplained gap is indistinguishable from laziness.
// @ts-expect-error
const noReason: MissingProps = { what: "DateRangePicker" };
void noReason;

// 3) @ts-expect-error: `what` is mandatory too. There is no such thing as
// a gap for nothing in particular.
// @ts-expect-error
const noWhat: MissingProps = { reason: "no range variant exists" };
void noWhat;

// 4) @ts-expect-error: `style` would let a caller hide or resize the
// contract element outside the token system, so it does not compile.
const withStyle: MissingProps = {
  what: "DateRangePicker",
  reason: "no range variant exists",
  // @ts-expect-error
  style: { display: "none" },
};
void withStyle;

// 5) @ts-expect-error: `role` would let a caller change the accessible
// semantics of a declared gap, so it does not compile.
const withRole: MissingProps = {
  what: "DateRangePicker",
  reason: "no range variant exists",
  // @ts-expect-error
  role: "alert",
};
void withRole;

// 6) @ts-expect-error: `aria-label` would let a caller replace the
// generated accessible name, so it does not compile.
const withAriaLabel: MissingProps = {
  what: "DateRangePicker",
  reason: "no range variant exists",
  // @ts-expect-error
  "aria-label": "something else entirely",
};
void withAriaLabel;
