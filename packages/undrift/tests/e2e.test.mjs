// The outcome test: the gate holds the real codebase (and a realistically
// implemented screen) at ZERO drift, and catches every seeded violation in
// the drifted twin — by rule, with exact counts.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { describe, expect, test } from "vitest";
import { loadContract } from "../src/contract.mjs";
import { gateProfile, gateFiles } from "../src/gate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const sampleRoot = resolve(here, "../../..");
const contract = loadContract(sampleRoot);
const appRules = contract.profiles.app.rules;

describe("the real codebase is undrift", () => {
  test("profile system: every shipped component conforms", () => {
    const { files, violations } = gateProfile("system", { contract });
    expect(files).toBeGreaterThan(10);
    expect(violations).toEqual([]);
  });

  test("profile app: the whole demo dashboard conforms", () => {
    const { files, violations } = gateProfile("app", { contract });
    expect(files).toBeGreaterThan(5);
    expect(violations).toEqual([]);
  });
});

describe("a newly implemented screen", () => {
  test("clean settings screen: zero violations under the full app rule set", () => {
    const { files, violations } = gateFiles(
      ["packages/undrift/tests/corpus/clean/settings-screen.tsx"],
      { rules: appRules, contract }
    );
    expect(files).toBe(1);
    expect(violations).toEqual([]);
  });

  test("drifted twin: every seeded violation is caught, by rule, exact counts", () => {
    const { violations } = gateFiles(
      ["packages/undrift/tests/corpus/drift/settings-screen-drifted.tsx"],
      { rules: appRules, contract }
    );
    const byRule = {};
    for (const v of violations) byRule[v.rule] = (byRule[v.rule] ?? 0) + 1;

    expect(byRule).toEqual({
      "no-foreign-ui-imports": 1, // @mui/material
      "no-raw-colors": 5, // hex const, hsl const, bg-[#f8fafc], template hex, inline style hex
      "no-arbitrary-values": 3, // bg-[#f8fafc], text-[#94a3b8], rounded-[8px]
      "no-inline-style-values": 3, // fontSize "22px", borderRadius 8, padding 14
      "no-raw-elements": 4, // input, select, button, table
    });
    expect(violations).toHaveLength(16);

    // messages are agent-legible: they name the fix, not just the crime
    const rawButton = violations.find((v) => v.found === "<button>");
    expect(rawButton.message).toContain("<Button>");
    const hex = violations.find((v) => v.found === "#e0481e");
    expect(hex.message).toContain("Nearest token");
  });
});

describe("the CLI end to end", () => {
  const bin = resolve(here, "../bin/undrift.mjs");

  test("undrift gate --format json passes on the real repo", () => {
    const out = execFileSync(process.execPath, [bin, "gate", "--format", "json"], {
      cwd: sampleRoot,
      encoding: "utf8",
    });
    const result = JSON.parse(out);
    expect(result.pass).toBe(true);
    expect(result.runs.map((r) => r.name).sort()).toEqual(["app", "system"]);
  });

  test("undrift gate exits 1 on the drifted fixture", () => {
    let code = 0;
    try {
      execFileSync(
        process.execPath,
        [bin, "gate", "packages/undrift/tests/corpus/drift/settings-screen-drifted.tsx", "--profile", "app"],
        { cwd: sampleRoot, encoding: "utf8" }
      );
    } catch (err) {
      code = err.status;
    }
    expect(code).toBe(1);
  });
});
