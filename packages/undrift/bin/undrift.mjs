#!/usr/bin/env node
// undrift — the enforcement layer for agent-ready design systems.
//   undrift init  <package>  [--config <dir>] [--force]
//   undrift gate  [paths…] [--profile app|system] [--format json]
//   undrift audit          [--format json]
// Exit codes: 0 = clean, 1 = violations/failed metrics, 2 = usage error.
import { loadContract } from "../src/contract.mjs";
import { gateProfile, gateFiles, compliance, ALL_RULES } from "../src/gate.mjs";
import { runAudit } from "../src/audit.mjs";
import { runInit } from "../src/init.mjs";
import { statusLine } from "../src/report.mjs";
import { loadState } from "../src/state.mjs";
import { buildTriage, formatTriage } from "../src/triage.mjs";
import { relative, resolve } from "node:path";
import { existsSync, statSync, writeFileSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const command = args[0];

const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
// Boolean flags take no value, so the argument after them is a real path.
// Without this exclusion `undrift gate --strict src/x.tsx` silently swallows
// the path and gates nothing — a green run that proves nothing.
const BOOLEAN_FLAGS = new Set(["--strict", "--force", "--explain"]);
const paths = args.slice(1).filter((a, i, all) => {
  if (a.startsWith("--")) return false;
  const prev = all[i - 1];
  return !(prev && prev.startsWith("--") && !BOOLEAN_FLAGS.has(prev));
});

const format = flag("format", "text");
const configPath = flag("config", process.cwd());

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function usage() {
  console.log(`undrift — the enforcement layer for agent-ready design systems

Usage:
  undrift init <package>  [--config <dir>] [--force]
  undrift gate [paths…]  [--profile <name>] [--config <path>] [--format json] [--strict]
  undrift triage         [--config <path>]
  undrift audit          [--config <path>] [--format json]

init   Detect an installed design system and scaffold undrift.config.json
       plus the <Missing> placeholder. Existing files are kept unless --force.
gate   Check source against the design system's contract. With no paths,
       runs every configured profile. With paths, runs them under --profile
       (default: app). Declared gaps pass the dev loop; --strict (release/CI)
       fails on them.
triage List outstanding gaps, ranked by how often each was needed, with the
       legitimate resolutions for each. A listing — it never fails.
audit  Compute the five value metrics for the configured system.
`);
}

try {
  if (command === "init") {
    const pkgName = paths[0];
    if (!pkgName) {
      console.error(red("undrift init needs the design system's package name, e.g. undrift init @acme/ds"));
      process.exit(2);
    }
    const result = runInit(configPath, pkgName, { force: args.includes("--force") });

    console.log(bold(`undrift init — ${result.system}`));
    console.log(`  ${result.components.length} component(s) from ${dim(result.componentsFrom ?? "(no type declarations found)")}`);
    console.log(`  tokens from ${dim(result.tokensCss ?? "(no stylesheet found)")}`);
    const mapped = Object.entries(result.intrinsics).filter(([, v]) => v);
    if (mapped.length) {
      console.log(`  intrinsics ${dim(mapped.map(([tag, name]) => `<${tag}> → <${name}>`).join(", "))}`);
    }
    console.log(
      result.wroteConfig
        ? green(`  wrote ${result.configPath}`)
        : dim(`  kept existing ${result.configPath} (--force to overwrite)`)
    );
    console.log(
      result.wrotePlaceholder
        ? green(`  wrote ${result.placeholderPath}`)
        : dim(`  kept existing ${result.placeholderPath} (--force to overwrite)`)
    );
    console.log(dim(`\nNext: undrift gate --config ${configPath}`));
    process.exit(0);
  } else if (command === "gate") {
    const contract = loadContract(configPath);
    // Gaps never fail the dev loop; --strict (release/CI) promotes them.
    const strict = args.includes("--strict");
    const runs = [];
    if (paths.length > 0) {
      const profile = flag("profile", "app");
      runs.push({ name: profile, ...gateProfile(profile, { contract, extraPatterns: paths, strict }) });
    } else {
      const only = flag("profile");
      const names = only ? [only] : Object.keys(contract.profiles);
      for (const name of names) runs.push({ name, ...gateProfile(name, { contract, strict }) });
    }

    const all = runs.flatMap((r) => r.violations);
    // Totals live in `runs`, so reduce them back out — the A/B measurement
    // reads the headline compliance number straight out of the JSON payload.
    const totals = runs.reduce(
      (a, r) => ({
        gaps: a.gaps + (r.gaps?.length ?? 0),
        exemptions: a.exemptions + (r.exemptions?.length ?? 0),
        total: a.total + (r.declarations?.total ?? 0),
        resolved: a.resolved + (r.declarations?.resolved ?? 0),
      }),
      { gaps: 0, exemptions: 0, total: 0, resolved: 0 }
    );
    const declarations = { total: totals.total, resolved: totals.resolved };

    if (format === "json") {
      console.log(JSON.stringify({
        pass: all.length === 0,
        strict,
        system: contract.system,
        declarations,
        compliance: compliance(declarations),
        gaps: totals.gaps,
        exemptions: totals.exemptions,
        runs,
      }, null, 2));
    } else {
      for (const r of runs) {
        const status = r.violations.length === 0 ? green("✓ clean") : red(`✗ ${r.violations.length} violation(s)`);
        console.log(`${bold(`profile ${r.name}`)}  ${dim(`${r.files} file(s)`)}  ${status}`);
        for (const v of r.violations) {
          console.log(`  ${red("✗")} ${v.file}:${v.line}:${v.column}  ${dim(`[${v.rule}]`)}`);
          console.log(`     ${v.message}`);
        }
      }
      // `strict` is passed through so the line names unresolved gaps instead of
      // counting each one twice (once as a violation, once as a gap).
      const line = statusLine({
        declarations: declarations.total,
        violations: all.length,
        gaps: totals.gaps,
        exemptions: totals.exemptions,
        strict,
        system: contract.system,
      });
      console.log("\n" + (all.length === 0 ? green(line) : red(line)));
      if (all.length > 0) {
        console.log(dim("The messages above name the exact fix — apply and re-run."));
      } else if (totals.gaps > 0) {
        console.log(dim(`Gaps are a success state here; \`undrift triage\` lists them, \`--strict\` blocks them at release.`));
      }
      // An exemption is a violation someone talked their way out of. Silence
      // about them is how "0 violations" stops meaning anything.
      if (totals.exemptions > 0) {
        console.log(dim(`${totals.exemptions} exemption(s) suppressed a rule — a suppressed rule is still a rule that did not run. Re-read the reasons.`));
      }
    }
    process.exit(all.length === 0 ? 0 : 1);
  } else if (command === "triage") {
    // On-request only, and never a failure: triage enumerates decisions a human
    // has to make, and penalising the agent for surfacing them would push it
    // straight back to improvising.
    const contract = loadContract(configPath);
    const gaps = [];
    for (const name of Object.keys(contract.profiles)) {
      for (const g of gateProfile(name, { contract }).gaps) {
        gaps.push({ ...g, file: relative(contract.root, g.file) });
      }
    }
    const { decisions } = loadState(contract.root);
    const items = buildTriage({ gaps, decisions });
    if (items.length > 0) console.log(bold(`undrift triage — ${items.length} outstanding`) + "\n");
    console.log(formatTriage(items));
    process.exit(0);
  } else if (command === "audit") {
    const contract = loadContract(configPath);
    const result = runAudit(contract);
    if (format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(bold(`undrift audit — ${result.system}`));
      console.log(dim(result.root) + "\n");
      for (const m of result.metrics) {
        console.log(`${m.pass ? green("✓") : red("✗")} ${bold(m.title)}`);
        console.log(`   ${m.summary}`);
        for (const d of m.detail.slice(0, 25)) console.log(dim(`   ${d}`));
      }
      console.log(
        result.pass
          ? green(`\nAll five metrics hold. This system is agent-enforceable — and this report is reproducible: re-run it yourself.`)
          : red(`\nSome metrics failed — each line above is a concrete finding, not an opinion.`)
      );
    }
    process.exit(result.pass ? 0 : 1);
  } else {
    usage();
    process.exit(command ? 2 : 0);
  }
} catch (err) {
  console.error(red(`undrift: ${err.message}`));
  process.exit(2);
}
