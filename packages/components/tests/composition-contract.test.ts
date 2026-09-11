import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

// COMPOSITION.md is a rule table, and every rule names the token or export it
// is expressed in. This test is what keeps taste out: a rule that cannot name
// its basis cannot be added, because the build fails.
const root = process.cwd();
const md = readFileSync(resolve(root, "COMPOSITION.md"), "utf8");
const tokens = JSON.parse(readFileSync(resolve(root, "../tokens/dist/json/tokens.json"), "utf8"));
const barrel = readFileSync(resolve(root, "src/index.ts"), "utf8");

// Every export reachable from the barrel, by reading the files it re-exports.
function exportedNames(): Set<string> {
  const names = new Set<string>();
  for (const m of barrel.matchAll(/export \* from "([^"]+)";/g)) {
    const src = readFileSync(resolve(root, "src", m[1] + ".tsx"), "utf8");
    for (const e of src.matchAll(/export (?:function|const|class) ([A-Z][A-Za-z0-9]*)/g)) names.add(e[1]);
  }
  for (const m of barrel.matchAll(/export \{ ([^}]+) \}/g)) for (const n of m[1].split(",")) names.add(n.trim());
  return names;
}

function rules(): Array<{ rule: string; basis: string[] }> {
  const out: Array<{ rule: string; basis: string[] }> = [];
  let inTable = false;
  for (const line of md.split("\n")) {
    if (line.startsWith("| Rule |")) { inTable = true; continue; }
    if (!inTable) continue;
    if (!line.startsWith("|")) break;
    if (/^\|\s*-+/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    const basis = [...cells[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    out.push({ rule: cells[0], basis });
  }
  return out;
}

test("the rule table is present and non-trivial", () => {
  expect(rules().length).toBeGreaterThanOrEqual(8);
});

test("every rule names at least one basis, and every basis is a real token or a real export", () => {
  const exports = exportedNames();
  const missing: string[] = [];
  for (const { rule, basis } of rules()) {
    if (basis.length === 0) missing.push(`${rule}: names nothing`);
    for (const b of basis) {
      const isToken = ("--" + b.replace(/\./g, "-")) in tokens;
      const isExport = exports.has(b);
      if (!isToken && !isExport) missing.push(`${rule}: \`${b}\` is neither a token in dist/json/tokens.json nor an export of src/index.ts`);
    }
  }
  expect(missing, missing.join("\n")).toEqual([]);
});

test("the story the checklist is answered against exists", () => {
  const fm = md.match(/^---\nstory:\s*(.+)\n---/);
  expect(fm, "COMPOSITION.md needs a story: frontmatter field").not.toBeNull();
  const [title, name] = [fm![1].split("/").slice(0, -1).join("/"), fm![1].split("/").pop()];
  const stories = readFileSync(resolve(root, "src/components/page/page.stories.tsx"), "utf8");
  expect(stories).toContain(`title: "${title}"`);
  expect(stories).toContain(`name: "${name}"`);
});
