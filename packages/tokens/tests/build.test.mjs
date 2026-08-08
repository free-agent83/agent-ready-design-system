import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { expect, test, beforeAll } from "vitest";
const root = new URL("..", import.meta.url).pathname;
beforeAll(() => execSync("node build.mjs", { cwd: root }));
const css = () => readFileSync(root + "dist/web/tokens.css", "utf8");

test("primitives in :root, semantics as var() refs", () => {
  expect(css()).toMatch(/:root\s*\{[^}]*--color-primitive-slate-900/s);
  expect(css()).toMatch(/--color-semantic-background:\s*var\(--color-primitive/);
});
test("default theme emits light + dark scopes", () => {
  expect(css()).toMatch(/\[data-theme="default"\]\s*\{/);
  expect(css()).toMatch(/\[data-theme="default"\]\.dark\s*\{/);
});
test("dark is GENERATED FROM SOURCE — background rebinds to a different primitive than light", () => {
  const light = css().match(/\[data-theme="default"\]\s*\{([^}]*)\}/s)[1];
  const dark  = css().match(/\[data-theme="default"\]\.dark\s*\{([^}]*)\}/s)[1];
  const bg = s => s.match(/--color-semantic-background:\s*(var\([^)]+\))/)[1];
  expect(bg(light)).toMatch(/slate-50/);
  expect(bg(dark)).toMatch(/slate-900/);
  expect(bg(light)).not.toBe(bg(dark));
});
// Retargeted from `contrast` to `portfolio` when contrast was authored. The
// property under test is "an empty theme source emits nothing", not "contrast
// specifically is empty", so it needs to point at whichever slot is still a
// stub. If portfolio is ever authored too, this test needs a purpose-built
// empty fixture rather than another retarget.
test("empty theme source emits NO scope (no phantom themes)", () => {
  expect(css()).not.toMatch(/\[data-theme="portfolio"\]/);
});

test("an authored theme DOES emit both scopes", () => {
  // The other half of the pair above: proves the skip is driven by the source
  // being empty, not by the theme being anything other than `default`.
  expect(css()).toMatch(/\[data-theme="contrast"\]\s*\{/);
  expect(css()).toMatch(/\[data-theme="contrast"\]\.dark\s*\{/);
});
test("status roles emit for every status, each with a -foreground and -subtle surface", () => {
  const light = css().match(/\[data-theme="default"\]\s*\{([^}]*)\}/s)[1];
  for (const role of ["success", "warning", "danger", "info"]) {
    for (const suffix of ["", "-foreground", "-subtle"]) {
      expect(light).toMatch(new RegExp(`--color-semantic-${role}${suffix}:\\s*var\\(`));
    }
  }
});
test("status roles rebind for dark (subtle surface flips light↔deep)", () => {
  const light = css().match(/\[data-theme="default"\]\s*\{([^}]*)\}/s)[1];
  const dark  = css().match(/\[data-theme="default"\]\.dark\s*\{([^}]*)\}/s)[1];
  const subtle = s => s.match(/--color-semantic-success-subtle:\s*(var\([^)]+\))/)[1];
  expect(subtle(light)).toMatch(/emerald-50/);
  expect(subtle(dark)).toMatch(/emerald-950/);
});
test("chart roles emit chart-1..5 and rebind one step lighter in dark", () => {
  const light = css().match(/\[data-theme="default"\]\s*\{([^}]*)\}/s)[1];
  const dark  = css().match(/\[data-theme="default"\]\.dark\s*\{([^}]*)\}/s)[1];
  for (let i = 1; i <= 5; i++) {
    expect(light).toMatch(new RegExp(`--color-semantic-chart-${i}:\\s*var\\(`));
    expect(dark).toMatch(new RegExp(`--color-semantic-chart-${i}:\\s*var\\(`));
  }
  const c1 = s => s.match(/--color-semantic-chart-1:\s*(var\([^)]+\))/)[1];
  expect(c1(light)).toMatch(/indigo-400/);
  expect(c1(dark)).toMatch(/indigo-300/);
});
test("elevation primitives emit as raw box-shadow strings in :root", () => {
  const root = css().match(/:root\s*\{([\s\S]*?)\n\}/)[1];
  expect(root).toMatch(/--shadow-primitive-elevation-sm:\s*0px 1px 2px/);
  expect(root).toMatch(/--shadow-primitive-elevation-lg:.*hsl\(0 0% 0% \/ 0\.10\)/);
});
test("elevation semantic roles rebind light↔dark (dark shadows are tuned separately)", () => {
  const light = css().match(/\[data-theme="default"\]\s*\{([^}]*)\}/s)[1];
  const dark  = css().match(/\[data-theme="default"\]\.dark\s*\{([^}]*)\}/s)[1];
  const popover = s => s.match(/--shadow-semantic-popover:\s*(var\([^)]+\))/)[1];
  expect(popover(light)).toMatch(/elevation-md\b/);
  expect(popover(dark)).toMatch(/elevation-md-dark/);
  expect(popover(light)).not.toBe(popover(dark));
});
test("emits js + json", () => {
  expect(existsSync(root + "dist/js/tokens.js")).toBe(true);
  expect(existsSync(root + "dist/json/tokens.json")).toBe(true);
});
test("json emits CSS color strings, not raw DTCG blobs", () => {
  const tokens = JSON.parse(readFileSync(root + "dist/json/tokens.json", "utf8"));
  expect(tokens["--color-primitive-white"]).toBe("oklch(1 0 0)");
});
