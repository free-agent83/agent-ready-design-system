// The hook is the mechanism the whole tool exists for: documentation does not
// produce adherence, enforcement does. These tests pin the three properties
// that make it usable — it blocks, it never traps, and it stays silent.
import { expect, test } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = fileURLToPath(new URL("../hooks/undrift-hook.mjs", import.meta.url));

function repo() {
  const root = mkdtempSync(join(tmpdir(), "u-hook-"));
  mkdirSync(join(root, "app"), { recursive: true });
  writeFileSync(join(root, "ds.css"), ":root{--color-primary:#3b5bdb}");
  writeFileSync(join(root, "undrift.config.json"), JSON.stringify({
    system: "@acme/ds", tokensCss: "ds.css",
    profiles: { app: { include: ["app/**/*.tsx"], rules: ["no-raw-colors"] } },
  }));
  return root;
}

const run = (root, file) => {
  try {
    const stdout = execFileSync("node", [HOOK], {
      input: JSON.stringify({ tool_input: { file_path: file } }),
      cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
    });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
};

test("exits 0 and says nothing for clean source", () => {
  const root = repo();
  const f = join(root, "app/a.tsx");
  writeFileSync(f, `export const A = () => <div className="bg-primary" />;`);
  const r = run(root, f);
  expect(r.code).toBe(0);
  expect(r.stderr).toBe("");
});

test("exits 2 with the fix on stderr for a violation", () => {
  const root = repo();
  const f = join(root, "app/b.tsx");
  writeFileSync(f, `export const B = () => <div style={{ color: "#ff0000" }} />;`);
  const r = run(root, f);
  expect(r.code).toBe(2);
  expect(r.stderr).toMatch(/#ff0000/);
  expect(r.stderr).toMatch(/token/i);
});

test("ignores files outside the configured profile", () => {
  const root = repo();
  const f = join(root, "README.md");
  writeFileSync(f, "#ff0000");
  expect(run(root, f).code).toBe(0);
});

test("demands a decision rather than a fix after 3 attempts", () => {
  const root = repo();
  const f = join(root, "app/c.tsx");
  writeFileSync(f, `export const C = () => <div style={{ color: "#ff0000" }} />;`);
  const first = run(root, f);
  run(root, f);
  const third = run(root, f);
  expect(first.stderr).toMatch(/attempt 1\/3/);
  expect(third.code).toBe(2);
  expect(third.stderr).toMatch(/Stop retrying/);
  expect(third.stderr).toMatch(/Missing what/);
});

test("clears the attempt counter once the file is clean", () => {
  const root = repo();
  const f = join(root, "app/d.tsx");
  writeFileSync(f, `export const D = () => <div style={{ color: "#ff0000" }} />;`);
  run(root, f);
  writeFileSync(f, `export const D = () => <div className="bg-primary" />;`);
  expect(run(root, f).code).toBe(0);
  // a fresh violation starts from attempt 1, not 2
  writeFileSync(f, `export const D = () => <div style={{ color: "#00ff00" }} />;`);
  expect(run(root, f).stderr).toMatch(/attempt 1\/3/);
});

// P3: gaps are a success state. If declaring a gap were penalised the agent
// would improvise instead — the exact drift the hook exists to prevent.
test("a declared gap does not block the dev loop", () => {
  const root = repo();
  const f = join(root, "app/e.tsx");
  writeFileSync(f, `export const E = () => <Missing what="Rating" reason="no rating component exists" />;`);
  expect(run(root, f).code).toBe(0);
});

test("a dishonest gap does block", () => {
  const root = repo();
  const f = join(root, "app/f.tsx");
  writeFileSync(f, `export const F = () => <Missing what="Rating" reason="" />;`);
  const r = run(root, f);
  expect(r.code).toBe(2);
  expect(r.stderr).toMatch(/reason/i);
});

// The macOS symlink trap: cwd resolves to /private/var while a temp root is
// /var. Without realpathSync on BOTH sides nothing ever matches a profile and
// the hook exits 0 for everything — enforcing nothing while looking healthy.
test("matches profiles through symlinked roots (macOS /var vs /private/var)", () => {
  const root = repo();
  const f = join(root, "app/g.tsx");
  writeFileSync(f, `export const G = () => <div style={{ color: "#ff0000" }} />;`);
  // The unresolved temp path is exactly what a real hook payload carries.
  expect(root.startsWith("/private/")).toBe(false);
  expect(run(root, f).code).toBe(2);
});

test("exits 0 when the repo has no undrift config at all", () => {
  const root = mkdtempSync(join(tmpdir(), "u-hook-bare-"));
  const f = join(root, "a.tsx");
  writeFileSync(f, `export const A = () => <div style={{ color: "#ff0000" }} />;`);
  expect(run(root, f).code).toBe(0);
});
