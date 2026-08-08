// The schema is documentation that can go stale silently — the $schema key
// pointed at a non-existent file for most of this package's life. These tests
// fail the moment the schema falls behind the code, which is the only failure
// mode that matters here. No JSON Schema validator is a dependency, and adding
// one for this alone isn't worth it.
import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ALL_RULES } from "../src/gate.mjs";
import { buildConfig } from "../src/init.mjs";

const read = (rel) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));

const schema = read("../schema.json");
const ruleEnum =
  schema.properties.profiles.additionalProperties.properties.rules.items.enum;

test("the schema's rule enum matches ALL_RULES exactly", () => {
  expect([...ruleEnum].sort()).toEqual([...ALL_RULES].sort());
});

test("the schema documents every key the sample config uses", () => {
  const cfg = read("../../../undrift.config.json");
  const allowed = Object.keys(schema.properties);
  expect(Object.keys(cfg).filter((k) => !allowed.includes(k))).toEqual([]);
});

test("the schema documents every key `undrift init` generates", () => {
  const generated = buildConfig({
    system: "@acme/ds",
    tokensCss: "node_modules/@acme/ds/ds.css",
    componentsFrom: "node_modules/@acme/ds/index.d.ts",
    intrinsics: { button: "Button" },
  });
  const allowed = Object.keys(schema.properties);
  expect(Object.keys(generated).filter((k) => !allowed.includes(k))).toEqual([]);
});

test("init points $schema at the installed package, not a monorepo path", () => {
  const generated = buildConfig({
    system: "@acme/ds",
    tokensCss: "x.css",
    componentsFrom: "x.d.ts",
    intrinsics: {},
  });
  expect(generated.$schema).toBe("./node_modules/undrift/schema.json");
});

test("schema.json ships to npm", () => {
  const pkg = read("../package.json");
  expect(pkg.files).toContain("schema.json");
});
