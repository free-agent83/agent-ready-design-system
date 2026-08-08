// packages/undrift/tests/state.test.mjs
import { expect, test } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadState, recordDecision, STATE_FILE } from "../src/state.mjs";

test("loads empty state when no file exists", () => {
  expect(loadState(mkdtempSync(join(tmpdir(), "u-")))).toEqual({ version: 1, decisions: [] });
});

test("records a decision and persists it", () => {
  const root = mkdtempSync(join(tmpdir(), "u-"));
  recordDecision(root, { what: "Chip", resolution: "replace-with", with: "Badge", note: "close enough" });
  const state = loadState(root);
  expect(state.decisions).toHaveLength(1);
  expect(state.decisions[0]).toMatchObject({ what: "Chip", resolution: "replace-with", with: "Badge" });
  expect(readFileSync(join(root, STATE_FILE), "utf8")).toMatch(/Chip/);
});

test("replaces an existing decision for the same subject", () => {
  const root = mkdtempSync(join(tmpdir(), "u-"));
  recordDecision(root, { what: "Chip", resolution: "keep-gap" });
  recordDecision(root, { what: "Chip", resolution: "add-to-system" });
  const state = loadState(root);
  expect(state.decisions).toHaveLength(1);
  expect(state.decisions[0].resolution).toBe("add-to-system");
});
