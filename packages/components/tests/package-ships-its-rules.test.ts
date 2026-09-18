// @vitest-environment node
import { execFileSync } from "node:child_process";
import fg from "fast-glob";
import { beforeAll, expect, test } from "vitest";

// A product's agent reads the installed package, not this repository. So
// every rule document and every story has to be in what `npm pack` would
// ship. The package stays private: packing is not publishing.
const root = process.cwd(); // matches docs-coverage.test.ts
let shipped: Set<string>;

beforeAll(() => {
  const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: root, encoding: "utf8" });
  shipped = new Set(JSON.parse(out)[0].files.map((f: { path: string }) => f.path));
}, 60_000);

test("the map, the catalogue, the conventions and the composition contract ship", () => {
  for (const f of ["AGENTS.md", "CATALOG.md", "CONVENTIONS.md", "COMPOSITION.md"]) expect(shipped.has(f), `${f} is not in the package`).toBe(true);
});

for (const [what, pattern] of [
  ["COMPONENT.md", "src/components/**/COMPONENT.md"],
  ["story", "src/components/**/*.stories.tsx"],
  ["component source", "src/components/**/!(*.stories|*.test|*.test-d).tsx"],
] as const) {
  test(`every ${what} on disk ships`, () => {
    const onDisk = fg.sync(pattern, { cwd: root });
    expect(onDisk.length).toBeGreaterThan(0); // guard against a glob that matches nothing
    for (const f of onDisk) expect(shipped.has(f), `${f} is not in the package`).toBe(true);
  });
}
