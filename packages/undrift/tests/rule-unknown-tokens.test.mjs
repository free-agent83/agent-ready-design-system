import { expect, test } from "vitest";
import { gateSource } from "../src/gate.mjs";

const contract = {
  system: "@acme/ds",
  tokens: { "--color-primary": "#3b5bdb", "--color-error": "#e24b4a" },
  intrinsics: {}, foreignUi: [], exemptMarker: "token-exempt", catalog: [],
};
const run = (src) =>
  gateSource(src, { rules: ["no-unknown-tokens"], contract, fileName: "t.tsx" });

test("flags a var() reference to a token that does not exist", () => {
  const v = run(`const s = <div style={{ color: "var(--color-warning)" }} />;`);
  expect(v).toHaveLength(1);
  expect(v[0].rule).toBe("no-unknown-tokens");
  expect(v[0].found).toBe("--color-warning");
  expect(v[0].message).toMatch(/does not exist/i);
});

test("allows a var() reference to a real token", () => {
  expect(run(`const s = <div style={{ color: "var(--color-primary)" }} />;`)).toEqual([]);
});

test("allows var() with a fallback but still flags the missing name", () => {
  const v = run(`const s = <div style={{ color: "var(--nope, red)" }} />;`);
  expect(v).toHaveLength(1);
  expect(v[0].found).toBe("--nope");
});

test("does not flag when the token set is empty (unknown system)", () => {
  const v = gateSource(`const s = <div style={{ color: "var(--x)" }} />;`, {
    rules: ["no-unknown-tokens"], fileName: "t.tsx",
    contract: { ...contract, tokens: {} },
  });
  expect(v).toEqual([]);
});
