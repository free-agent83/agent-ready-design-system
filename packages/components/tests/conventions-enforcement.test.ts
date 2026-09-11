import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import fg from "fast-glob";
import { expect, test } from "vitest";

// CONVENTIONS.md carries one "Enforced by:" line per rule. Every gate that
// line names must exist, or the file is claiming a check it does not have,
// which is the article's failure mode (a spec nothing checks) wearing this
// repository's clothes. "not enforced", "partially" and "judgement" are legal
// and counted, so the file can report its own split honestly.
const root = process.cwd();
const md = readFileSync(resolve(root, "../../CONVENTIONS.md"), "utf8");
const gateSource = readFileSync(resolve(root, "../undrift/src/gate.mjs"), "utf8");
const gateRules = new Set([...gateSource.matchAll(/"(no-[a-z-]+)"/g)].map((m) => m[1]));
const testFiles = new Set(
  fg.sync(["tests/*.test.*", "src/components/**/*.test.*", "../tokens/tests/*.test.*"], { cwd: root }).map((f) => f.split("/").pop()!)
);

function rules(): Array<{ title: string; enforced: string | null }> {
  const out: Array<{ title: string; enforced: string | null }> = [];
  let current: { title: string; enforced: string | null } | null = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^###\s+(.+)$/);
    if (h) { current = { title: h[1].trim(), enforced: null }; out.push(current); continue; }
    const e = line.match(/^\*\*Enforced by:\*\*\s*(.+)$/);
    if (e && current) current.enforced = e[1].trim();
  }
  return out;
}

test("there are conventions, and every one carries an enforcement line", () => {
  const r = rules();
  expect(r.length).toBeGreaterThanOrEqual(10);
  expect(r.filter((x) => x.enforced === null).map((x) => x.title)).toEqual([]);
});

test("every gate a convention names exists; a line naming none says so", () => {
  const problems: string[] = [];
  for (const { title, enforced } of rules()) {
    const named = [...enforced!.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((n) => !n.startsWith("//") && !n.includes("<"));
    const gates = named.filter((n) => /^no-[a-z-]+$/.test(n) || /\.test\.[a-z]+$/.test(n));
    for (const g of gates) {
      const ok = gateRules.has(g) || testFiles.has(g);
      if (!ok) problems.push(`${title}: names \`${g}\`, which is neither a gate rule nor a test file`);
    }
    const qualified = /\b(not enforced|partially|judgement)\b/i.test(enforced!);
    if (gates.length === 0 && !qualified) problems.push(`${title}: names no gate and does not say it is unenforced`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("the file reports its own split, and is honest that some rules are judgement", () => {
  const r = rules();
  const unenforced = r.filter((x) => /not enforced/i.test(x.enforced!));
  const partial = r.filter((x) => /partially/i.test(x.enforced!) && !/not enforced/i.test(x.enforced!));
  const full = r.length - unenforced.length - partial.length;
  expect(full).toBeGreaterThan(0);
  expect(unenforced.length).toBeGreaterThan(0);
});
