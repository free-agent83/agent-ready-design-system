import { defineConfig } from "vitest/config";

// Six of this package's test files start a real `node` process (the CLI, the
// hook, triage), some several in a row. Locally each takes well under the 5s
// default; on a shared CI runner they do not, and they timed out one file at a
// time (hook.test.mjs, then gate-strict.test.mjs, 2026-09-18). The allowance is
// set once, for the package, so the next such test does not repeat it.
export default defineConfig({
  test: {
    testTimeout: 30_000,
  },
});
