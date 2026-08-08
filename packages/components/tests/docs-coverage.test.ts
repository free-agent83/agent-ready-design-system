import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import fg from "fast-glob";
import { expect, test } from "vitest";

const root = process.cwd(); // matches no-hardcoded-values.test.ts
const comps = fg.sync("src/components/**/!(*.stories|*.test|*.test-d).tsx", { cwd: root });

test("every component has a sibling COMPONENT.md", () => {
  expect(comps.length).toBeGreaterThan(0); // guard against a glob that matches nothing
  for (const f of comps) {
    const md = resolve(root, f.replace(/[^/]+\.tsx$/, "COMPONENT.md"));
    expect(existsSync(md), `missing COMPONENT.md for ${f}`).toBe(true);
  }
});

test("no stable COMPONENT.md has unchecked quality boxes", () => {
  for (const f of comps) {
    const md = resolve(root, f.replace(/[^/]+\.tsx$/, "COMPONENT.md"));
    if (existsSync(md)) {
      const t = readFileSync(md, "utf8");
      if (/status:\s*stable/.test(t)) expect(/- \[ \]/.test(t), `unchecked box in ${md}`).toBe(false);
    }
  }
});
