import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import fg from "fast-glob";
import { expect, test } from "vitest";

// A skill is documentation an agent acts on. A skill that names a file, a
// token, an export, a gate or a script that does not exist sends the agent
// somewhere real work cannot follow, which is the drift an unenforced spec
// suffers. Every backticked name in every SKILL.md has to resolve.
const root = process.cwd();
const repo = resolve(root, "../..");
const skills = fg.sync(".agents/skills/*/SKILL.md", { cwd: repo, absolute: true });
const tokens = JSON.parse(readFileSync(resolve(root, "../tokens/dist/json/tokens.json"), "utf8"));
const barrel = readFileSync(resolve(root, "src/index.ts"), "utf8");
const gateRules = new Set([...readFileSync(resolve(root, "../undrift/src/gate.mjs"), "utf8").matchAll(/"(no-[a-z-]+)"/g)].map((m) => m[1]));
const scripts = new Set(Object.keys(JSON.parse(readFileSync(resolve(repo, "package.json"), "utf8")).scripts ?? {}));
const testFiles = new Set(fg.sync(["tests/*.test.*", "src/components/**/*.test.*", "../tokens/tests/*.test.*"], { cwd: root }).map((f) => f.split("/").pop()!));

function exportedNames(): Set<string> {
  const names = new Set<string>();
  for (const m of barrel.matchAll(/export \* from "([^"]+)";/g)) {
    const src = readFileSync(resolve(root, "src", m[1] + ".tsx"), "utf8");
    for (const e of src.matchAll(/export (?:function|const|class) ([A-Z][A-Za-z0-9]*)/g)) names.add(e[1]);
  }
  return names;
}
const exports = exportedNames();

// What a backticked name may be, and how each kind is checked. Order matters:
// a path is tried before a token path, because `undrift.config.json` is both
// shapes and only one of them is true.
const tokensCss = readFileSync(resolve(root, "../tokens/dist/web/tokens.css"), "utf8");
const deps = new Set(Object.keys({ ...JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).dependencies, ...JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).devDependencies }));
const hooks = readFileSync(resolve(repo, ".claude/settings.json"), "utf8");
const knownBasenames = new Set(fg.sync(["**/*.md", "**/*.json"], { cwd: repo, ignore: ["**/node_modules/**", "**/dist/**"] }).map((f) => f.split("/").pop()!));
function resolves(name: string): boolean {
  if (/[<>…]/.test(name)) return true; // a placeholder: `<name>.tsx`, `<Missing what="…" />`
  if (/^(npm (run )?[a-z:-]+|undrift [a-z-]+|--strict)$/.test(name)) {
    const m = name.match(/^npm run ([a-z:-]+)$/);
    return m ? scripts.has(m[1]) : true; // `npm test`, `undrift triage`, flags: the CLI's own surface
  }
  if (/^(no-[a-z-]+)$/.test(name)) return gateRules.has(name);
  if (/\.test\.[a-z]+$/.test(name)) return testFiles.has(name);
  if (/^\/\//.test(name)) return true; // a comment marker: `// token-exempt`
  if (/^@?[a-z0-9-]+\/[a-z0-9-]+$/.test(name) && deps.has(name)) return true; // a package this package depends on
  // `dimension.radius.md` is token-shaped AND file-shaped; `undrift.config.json`
  // too. Try both readings and accept either, so neither shape masks the other.
  const tokenShaped = /^[a-z]+(\.[a-z0-9-]+)+$/.test(name);
  const fileShaped = /[/]/.test(name) || /\.(md|json|css|ts|tsx|mjs)$/.test(name);
  if (tokenShaped) {
    const cssVar = "--" + name.replace(/\./g, "-");
    if (cssVar in tokens || tokensCss.includes(cssVar + ":")) return true; // resolved in the JSON, or a theme role in the CSS
  }
  if (fileShaped) {
    if (existsSync(resolve(repo, name)) || existsSync(resolve(root, name))) return true;
    if (!name.includes("/") && knownBasenames.has(name)) return true; // `COMPONENT.md`: a filename that exists somewhere
  }
  if (tokenShaped || fileShaped) return false;
  if (/^[A-Z][A-Za-z0-9]*$/.test(name)) return exports.has(name) || hooks.includes(name); // a component export, or a hook name
  if (/^[A-Z][A-Za-z0-9]* [a-z]+="[a-z]+"$/.test(name)) return exports.has(name.split(" ")[0]); // `Stack gap="control"`
  return true; // prose in code font (`status: stable`, `success`, utility classes): not a reference
}

test("there are skills to check", () => {
  expect(skills.length).toBeGreaterThanOrEqual(5);
});

test("every SKILL.md has a name and a description, and every backticked reference resolves", () => {
  const problems: string[] = [];
  for (const file of skills) {
    const text = readFileSync(file, "utf8");
    if (!/^---\nname: .+\ndescription: .+\n---/m.test(text)) problems.push(`${file}: missing name or description frontmatter`);
    for (const m of text.matchAll(/`([^`\n]+)`/g)) {
      if (!resolves(m[1])) problems.push(`${file.split("/").slice(-2, -1)[0]}: \`${m[1]}\` does not resolve`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});
