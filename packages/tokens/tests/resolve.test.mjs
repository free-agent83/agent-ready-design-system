import { expect, test } from "vitest";
import { resolveRefs } from "../lib/resolve.mjs";

test("resolves {ref}", () => {
  const t = { color: { p: { white: { $value: "#fff" } }, s: { bg: { $value: "{color.p.white}" } } } };
  expect(resolveRefs(t).color.s.bg.$value).toBe("#fff");
});
test("throws a clear error on a missing ref", () => {
  expect(() => resolveRefs({ a: { $value: "{nope.missing}" } })).toThrow(/missing reference: nope\.missing/i);
});
test("throws on a circular ref", () => {
  expect(() => resolveRefs({ a: { $value: "{b}" }, b: { $value: "{a}" } })).toThrow(/circular/i);
});
