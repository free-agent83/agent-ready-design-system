#!/usr/bin/env node
// Claude Code PostToolUse hook — the mechanism that makes the rules unskippable
// rather than advisory. Exit 2 + stderr is fed back to the agent as an error it
// must act on, the instant it writes a file. Excellent documentation does not
// produce adherence; this closed loop does.
//
// Register in .claude/settings.json:
//   { "hooks": { "PostToolUse": [ { "matcher": "Edit|Write",
//       "hooks": [ { "type": "command",
//                    "command": "node node_modules/undrift/hooks/undrift-hook.mjs" } ] } ] } }
//
// Add `.undrift/` to the repo's .gitignore — attempt counters are scratch
// state. Decisions live in undrift.decisions.json, which IS committed.
import { readFileSync, writeFileSync, existsSync, realpathSync, mkdirSync } from "node:fs";
import { relative, resolve, dirname } from "node:path";
import fg from "fast-glob";
import { loadContract } from "../src/contract.mjs";
import { gateSourceWithGaps } from "../src/gate.mjs";

const read = (fd) => { try { return readFileSync(fd, "utf8"); } catch { return ""; } };

let payload = {};
try { payload = JSON.parse(read(0) || "{}"); } catch { process.exit(0); }

const file = payload.tool_input?.file_path;
if (!file || !existsSync(file)) process.exit(0);

// No config, unreadable config, anything unexpected: stay out of the way. A
// hook that errors on repos it doesn't understand gets uninstalled (P2).
let contract;
try { contract = loadContract(process.cwd()); } catch { process.exit(0); }

// realpathSync on BOTH sides: on macOS the hook's cwd resolves to /private/var
// while the path in the payload may be the /var symlink (or vice versa).
// Without this `rel` becomes ../../../.. and NOTHING ever matches a profile —
// the hook then exits 0 for every file and silently enforces nothing, while
// every one of its tests still looks green.
let root;
let rel;
try {
  root = realpathSync(contract.root);
  rel = relative(root, realpathSync(file));
} catch { process.exit(0); }

let rules = null;
for (const profile of Object.values(contract.profiles ?? {})) {
  const matched = fg.sync(profile.include ?? [], { cwd: root, dot: false });
  if (matched.includes(rel)) { rules = profile.rules; break; }
}
if (!rules) process.exit(0);

const { violations } = gateSourceWithGaps(readFileSync(file, "utf8"), {
  fileName: file, rules, contract,
});

// Bounded correction (spec R1). Enforcement must never trap the agent in a
// loop: after MAX_ATTEMPTS the message stops demanding a fix and starts
// demanding a DECISION — a declared gap or an explained exemption. This is what
// keeps R1 from violating P2 ("never block progress").
const MAX_ATTEMPTS = 3;
const attemptsPath = resolve(root, ".undrift/attempts.json");
const loadAttempts = () => {
  try { return JSON.parse(readFileSync(attemptsPath, "utf8")); } catch { return {}; }
};
const saveAttempts = (a) => {
  try {
    mkdirSync(dirname(attemptsPath), { recursive: true });
    writeFileSync(attemptsPath, JSON.stringify(a));
  } catch { /* scratch state — never fail the edit over it */ }
};

const attempts = loadAttempts();

// Silence by default (P5): a clean file produces no output at all.
if (violations.length === 0) {
  if (attempts[rel]) { delete attempts[rel]; saveAttempts(attempts); }
  process.exit(0);
}

const n = (attempts[rel] ?? 0) + 1;
attempts[rel] = n;
saveAttempts(attempts);

const detail = violations.map((v) => `  line ${v.line}: ${v.message}`).join("\n");

if (n >= MAX_ATTEMPTS) {
  console.error(
    `undrift — ${violations.length} violation(s) still present in ${rel} after ${n} attempts:\n` +
      detail +
      `\n\nStop retrying. Choose one:\n` +
      `  • If the design system genuinely cannot serve this, render ` +
      `<Missing what="…" reason="…" /> — a declared gap is correct behaviour.\n` +
      `  • If this value is genuinely unavoidable, add \`// ${contract.exemptMarker}: <reason>\` ` +
      `on the line and explain why.\n` +
      `Do not improvise a styled substitute.`
  );
} else {
  console.error(
    `undrift blocked this edit — ${violations.length} violation(s) in ${rel} (attempt ${n}/${MAX_ATTEMPTS}):\n` +
      detail +
      `\nFix these and rewrite the file. If the design system genuinely cannot serve this, ` +
      `use <Missing what="…" reason="…" /> instead of improvising.`
  );
}
process.exit(2);
