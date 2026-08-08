// packages/undrift/tests/init.test.mjs
import { expect, test } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectSystem, runInit } from "../src/init.mjs";

function repoWithPackage() {
  const root = mkdtempSync(join(tmpdir(), "u-init-"));
  const pkg = join(root, "node_modules/@acme/ds/dist");
  mkdirSync(pkg, { recursive: true });
  writeFileSync(join(pkg, "ds.css"), ":root{--a:1px}");
  writeFileSync(join(pkg, "index.d.ts"), "export * from './Button';");
  writeFileSync(join(root, "node_modules/@acme/ds/package.json"),
    JSON.stringify({ name: "@acme/ds", types: "./dist/index.d.ts" }));
  writeFileSync(join(root, "package.json"),
    JSON.stringify({ dependencies: { "@acme/ds": "^1.0.0" } }));
  return root;
}

test("detects an installed design system and its artifacts", () => {
  const found = detectSystem(repoWithPackage(), "@acme/ds");
  expect(found.system).toBe("@acme/ds");
  expect(found.componentsFrom).toMatch(/index\.d\.ts$/);
  expect(found.tokensCss).toMatch(/\.css$/);
});

test("init writes a config and copies the Missing template", () => {
  const root = repoWithPackage();
  runInit(root, "@acme/ds");
  expect(existsSync(join(root, "undrift.config.json"))).toBe(true);
  const cfg = JSON.parse(readFileSync(join(root, "undrift.config.json"), "utf8"));
  expect(cfg.system).toBe("@acme/ds");
  expect(existsSync(join(root, "components/undrift-missing.tsx"))).toBe(true);
});

test("generated profile covers the source files an agent will actually write", () => {
  const root = repoWithPackage();
  runInit(root, "@acme/ds");
  const cfg = JSON.parse(readFileSync(join(root, "undrift.config.json"), "utf8"));
  expect(cfg.profiles.app.include).toContain("src/**/*.{ts,tsx,jsx}");
  expect(cfg.profiles.app.include).toContain("app/**/*.{ts,tsx,jsx}");
  expect(cfg.profiles.app.rules).toHaveLength(7);
});

test("generated config excludes the placeholder itself", () => {
  const root = repoWithPackage();
  runInit(root, "@acme/ds");
  const cfg = JSON.parse(readFileSync(join(root, "undrift.config.json"), "utf8"));
  expect(JSON.stringify(cfg.profiles.app.include)).toMatch(/!.*undrift-missing/);
});
