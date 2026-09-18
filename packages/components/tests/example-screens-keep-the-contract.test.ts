import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import fg from "fast-glob";
import { expect, test } from "vitest";

// The example product's screens are what an agent copies. `TEMPLATES.md` names
// them as the reference for each page type, so a screen that hand-rolls its
// frame teaches the drift `COMPOSITION.md` exists to prevent. The gate cannot
// see this: a missing `Page` is not a raw value, and it passed all three screens
// while each re-derived the frame by hand (found 2026-09-18). This test can.
const root = process.cwd();
const repo = resolve(root, "../..");
const app = resolve(repo, "apps/web/app");
const screens = fg
  .sync("**/{page,loading}.tsx", { cwd: app })
  .filter((f) => f.startsWith("(dashboard)/"));
const templates = readFileSync(resolve(repo, "apps/web/TEMPLATES.md"), "utf8");

// What `COMPOSITION.md` and the `compose-a-screen` skill say never appears on a
// screen: a frame re-derived from raw containers, a raw heading, and a column
// count where `Grid` collapses by a token minimum.
const NEVER: Array<[RegExp, string]> = [
  [/<h[1-6][\s>]/, "a raw heading: use PageTitle, SectionTitle or CardTitle"],
  [/\bmx-auto\b/, "a hand-rolled page column: use Page"],
  [/\bmax-w-/, "a hand-rolled width ceiling: Page carries layout.page.max"],
  [/\bgrid-cols-/, "a column count: use Grid, which collapses at a token minimum"],
  [/\bcol-span-/, "a column span: Grid has none, by design"],
  [/\bspace-[xy]-/, "spacing by margin: use Stack"],
  [/\b-?m[trblxy]?-\d/, "spacing by margin: use Stack"],
];

test("there are example screens to check", () => {
  expect(screens.length).toBeGreaterThanOrEqual(4);
});

test("every example screen is built inside Page and keeps the compositional contract", () => {
  const problems: string[] = [];
  for (const rel of screens) {
    const src = readFileSync(resolve(app, rel), "utf8");
    if (!/<Page[\s>]/.test(src)) problems.push(`${rel}: not built inside Page`);
    for (const [pattern, why] of NEVER) {
      if (pattern.test(src)) problems.push(`${rel}: ${why}`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("every reference screen TEMPLATES.md names exists and is one of the checked screens", () => {
  const named = [...templates.matchAll(/`(app\/[^`]+\.tsx)`/g)].map((m) => m[1]);
  expect(named.length).toBeGreaterThanOrEqual(3);
  const problems = named.flatMap((path) => {
    if (!existsSync(resolve(repo, "apps/web", path))) return [`${path} does not exist`];
    if (!screens.includes(path.replace(/^app\//, ""))) return [`${path} is not an example screen this test checks`];
    return [];
  });
  expect(problems, problems.join("\n")).toEqual([]);
});
