// packages/undrift/tests/report.test.mjs
import { expect, test } from "vitest";
import { statusLine, gapNotice } from "../src/report.mjs";

test("status line is one line and states compliance", () => {
  const s = statusLine({ declarations: 47, violations: 0, gaps: 2, system: "@basalt/ds" });
  expect(s.split("\n")).toHaveLength(1);
  expect(s).toMatch(/47/);
  expect(s).toMatch(/2 gaps?/);
});

test("status line reports violations when present", () => {
  expect(statusLine({ declarations: 10, violations: 3, gaps: 0 })).toMatch(/3 violations?/);
});

// An exemption is an invisible violation: "0 violations, 14 exemptions" is not
// a clean run. Until now the count existed only in --format json.
test("status line surfaces exemptions when there are any", () => {
  const s = statusLine({ declarations: 20, violations: 0, exemptions: 14 });
  expect(s).toMatch(/14 exemptions/);
});

test("status line stays quiet about exemptions when there are none", () => {
  expect(statusLine({ declarations: 20, violations: 0, exemptions: 0 })).not.toMatch(/exemption/);
});

test("status line uses the singular for one exemption", () => {
  expect(statusLine({ declarations: 20, violations: 1, exemptions: 1 })).toMatch(/1 exemption\b/);
});

// Under --strict every valid gap is ALSO an `unresolved-gap` violation, so
// counting both reports one item twice ("✗ 1 violation · 1 gap").
test("strict names the gap instead of double-counting it", () => {
  const s = statusLine({ declarations: 47, violations: 1, gaps: 1, strict: true });
  expect(s).toMatch(/✗ 1 unresolved gap/);
  expect(s).not.toMatch(/violation/);
  expect(s).not.toMatch(/·\s*1 gap\b/);
});

test("strict separates real violations from unresolved gaps", () => {
  const s = statusLine({ declarations: 47, violations: 3, gaps: 1, strict: true });
  expect(s).toMatch(/✗ 2 violations/);
  expect(s).toMatch(/1 unresolved gap/);
});

test("non-strict still reports gaps as the success state they are", () => {
  const s = statusLine({ declarations: 47, violations: 0, gaps: 2 });
  expect(s).toMatch(/✓ on-system/);
  expect(s).toMatch(/2 gaps/);
});

test("gap notice has summary, system reason, and need", () => {
  const n = gapNotice({
    what: "DateRangePicker",
    reason: "Basalt has single-date Calendar only — no range variant exists.",
    need: "The booking form filters by check-in and check-out.",
  });
  expect(n).toMatch(/Gap: DateRangePicker/);
  expect(n).toMatch(/no range variant/);
  expect(n).toMatch(/check-in and check-out/);
});
