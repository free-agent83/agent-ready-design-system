// The gate engine. Parses source with the TypeScript compiler API (AST, not
// regex — regex validators get evaded; the longhand-border and monospace
// escapes that motivated this design are in the conformance tests) and checks
// it against the contract. Every violation message is written for an agent:
// it names the rule, the offending value, and the substitution that fixes it.
import ts from "typescript";
import { readFileSync } from "node:fs";
import fg from "fast-glob";
import { tokenColorIndex, nearestToken, isColorValue } from "./nearest.mjs";
import { findGaps } from "./gaps.mjs";

export const ALL_RULES = [
  "no-raw-colors",
  "no-arbitrary-values",
  "no-raw-elements",
  "no-foreign-ui-imports",
  "no-inline-style-values",
  "no-unknown-tokens",
  "no-unknown-components",
];

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
// `color-mix` is here because blending two legal tokens produces a third colour
// that is in neither — an evasion that reads as on-system at a glance.
const COLOR_FN_RE = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color|color-mix)\(/g;
// Non-global twins for one-off `.test()` calls: a /g regex carries lastIndex
// between calls, and matchAll() inherits it — testing with the global ones
// would silently skip matches later in the same file.
const HEX_TEST = new RegExp(HEX_RE.source);
const COLOR_FN_TEST = new RegExp(COLOR_FN_RE.source);
const ARBITRARY_PX_RE = /-\[\d*\.?\d+px\]/g;
const ARBITRARY_COLOR_RE = /\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch)\()[^\]]*\]/g;
const PX_STRING_RE = /^\d*\.?\d+(px|rem|em)$/;
const VAR_REF_RE = /var\(\s*(--[A-Za-z0-9_-]+)/g;

// Strictly colour-valued style properties. Anything set here that isn't a token
// is a colour the system never chose — including a bare keyword like `crimson`,
// which is the obvious next move once hex literals are blocked. The shorthands
// (`background`, `border`, `boxShadow`) are deliberately absent: they carry
// non-colour values too, and a rule that misfires gets switched off.
const COLOR_VALUED_PROPS = new Set([
  "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor",
  "borderBottomColor", "borderLeftColor", "borderBlockColor", "borderInlineColor",
  "outlineColor", "caretColor", "accentColor", "textDecorationColor", "textEmphasisColor",
  "columnRuleColor", "fill", "stroke", "floodColor", "stopColor", "lightingColor",
]);
// Values that choose no colour of their own — inheriting or opting out is fine.
const COLOR_KEYWORDS = new Set([
  "", "inherit", "currentcolor", "transparent", "none", "unset", "initial",
  "revert", "revert-layer", "auto",
]);
// JSX attributes whose value is an identifier, not a style. `href="#fade"` and
// `fill="url(#fade)"` are id references — reading them as hex colours would
// block correct SVG on every edit.
const ID_REF_ATTRS = new Set([
  "href", "xlinkHref", "to", "id", "htmlFor", "form", "headers", "list",
  "aria-controls", "aria-labelledby", "aria-describedby", "aria-owns",
]);

// style-object properties where a bare number is unitless and legitimate
const UNITLESS_STYLE_PROPS = new Set([
  "opacity", "zIndex", "flex", "flexGrow", "flexShrink", "order",
  "fontWeight", "lineHeight", "zoom", "tabSize", "columns", "aspectRatio",
]);

/**
 * Run the gate over one source string.
 * Returns [{ rule, line, column, found, message }] (line/column 1-based).
 */
// A raw-palette layer, in the generic token-layering sense (primitive →
// semantic → component). Deprioritised when picking examples: pointing an
// agent at a raw palette entry tells it to reach past the layer the system
// wants it to use. This matches a naming CONVENTION, never a token name from
// any particular design system.
const PALETTE_LAYER_RE = /(?:^|[-_])(?:primitive|primitives|palette|raw)(?:$|[-_])/i;

/**
 * Real token names from the loaded contract, to use as examples when there is
 * no nearest match to name.
 *
 * The fallback advice used to read "(bg-primary, text-foreground, …)" — this
 * sample's own token names, hardcoded. Point undrift at another design system
 * and it confidently instructed the agent to use utilities that do not exist
 * there. Examples must be derived from the contract or omitted entirely; an
 * invented name is worse than no example at all.
 *
 * Colour-ish tokens only (by name or by value), because this advice answers a
 * raw-COLOUR violation: naming a spacing token would be its own wrong answer.
 */
function colorTokenExamples(tokens, limit = 3) {
  const colorish = Object.entries(tokens ?? {})
    .filter(([name, value]) => /colou?r/i.test(name) || isColorValue(value))
    .map(([name]) => name);
  if (colorish.length === 0) return [];
  const roles = colorish.filter((name) => !PALETTE_LAYER_RE.test(name));
  return (roles.length ? roles : colorish).slice(0, limit);
}

export function gateSource(source, { fileName = "input.tsx", rules = ALL_RULES, contract }) {
  const active = new Set(rules);
  const violations = [];
  const lines = source.split("\n");

  // An escape hatch that demands an explanation stays honest; one that doesn't
  // becomes the cheapest path to "done". Require `marker: <reason>`.
  const exemptRe = new RegExp(`${contract.exemptMarker}\\s*:\\s*(\\S.*)$`);
  const exemptions = [];
  const exempt = (lineIdx) => {
    const m = lines[lineIdx]?.match(exemptRe);
    if (!m) return false;
    exemptions.push({ line: lineIdx + 1, reason: m[1].trim(), file: fileName });
    return true;
  };
  const colorIndex = tokenColorIndex(contract.tokens);

  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const report = (rule, node, found, message) => {
    const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    if (exempt(line)) return;
    violations.push({ rule, line: line + 1, column: character + 1, found, message });
  };

  const examples = colorTokenExamples(contract.tokens);
  const noMatchAdvice = examples.length
    ? ` Use a colour token from ${contract.system || "the token set"} — e.g. ${examples
        .map((n) => `var(${n})`)
        .join(", ")} — or the utility that maps to it.`
    : ` Use a colour token from the token set, or its utility, instead of a raw value; if the system has no token that fits, propose one rather than inlining a colour.`;

  const suggestColor = (raw) => {
    const near = nearestToken(colorIndex, raw);
    return near
      ? ` Nearest token: ${near.name} — use its semantic utility or var(${near.name}).`
      : noMatchAdvice;
  };

  // `#fade` after `url(` is a fragment identifier, not a colour.
  const isIdRef = (text, index) =>
    text.slice(Math.max(0, index - 4), index).toLowerCase().endsWith("url(");

  const checkText = (node, text, { idRefContext = false } = {}) => {
    if (active.has("no-raw-colors")) {
      for (const m of text.matchAll(HEX_RE)) {
        if (idRefContext || isIdRef(text, m.index)) continue;
        report(
          "no-raw-colors", node, m[0],
          `Raw colour ${m[0]} bypasses the token system.${suggestColor(m[0])}`
        );
      }
      for (const m of text.matchAll(COLOR_FN_RE)) {
        // report the whole call if we can slice it, else the function name
        const call = text.slice(m.index, text.indexOf(")", m.index) + 1) || m[0];
        report(
          "no-raw-colors", node, call,
          `Raw colour ${call} bypasses the token system.${suggestColor(call)}`
        );
      }
    }
    if (active.has("no-arbitrary-values")) {
      for (const m of text.matchAll(ARBITRARY_PX_RE)) {
        report(
          "no-arbitrary-values", node, m[0],
          `Tailwind arbitrary value ${m[0]} bypasses the spacing/size scale. Use a scale utility (e.g. rounded-md, h-10) or propose a token — never inline a magic number.`
        );
      }
      for (const m of text.matchAll(ARBITRARY_COLOR_RE)) {
        report(
          "no-arbitrary-values", node, m[0],
          `Tailwind arbitrary colour ${m[0]} bypasses the token system. Use a semantic utility (bg-primary, text-muted-foreground, …).`
        );
      }
    }
    // A var() pointing at a token that doesn't exist renders wrong SILENTLY —
    // CSS treats the declaration as invalid rather than erroring. Skipped when
    // the token set is empty (we can't distinguish unknown from missing).
    if (active.has("no-unknown-tokens") && Object.keys(contract.tokens ?? {}).length > 0) {
      for (const m of text.matchAll(VAR_REF_RE)) {
        if (m[1] in contract.tokens) continue;
        report(
          "no-unknown-tokens", node, m[1],
          `Token ${m[1]} does not exist in ${contract.system ?? "the design system"}. ` +
          `CSS fails silently here — the declaration is dropped and the element inherits instead. ` +
          `Use a real token, or declare a gap if the system genuinely lacks this role.`
        );
      }
    }
  };

  const checkStyleObject = (objLiteral) => {
    for (const prop of objLiteral.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = prop.name.getText(sf).replace(/['"]/g, "");
      const init = prop.initializer;

      // A literal colour in a colour-valued property. Hex and colour functions
      // are already reported from the string itself, so this catches what's
      // left: named colours (`crimson`), and anything else that isn't a token.
      if (active.has("no-raw-colors") && COLOR_VALUED_PROPS.has(name) && ts.isStringLiteralLike(init)) {
        const value = init.text.trim();
        const lower = value.toLowerCase();
        const alreadyReported = HEX_TEST.test(value) || COLOR_FN_TEST.test(value);
        if (
          !alreadyReported &&
          !lower.includes("var(--") &&
          !lower.startsWith("url(") &&
          !COLOR_KEYWORDS.has(lower)
        ) {
          report(
            "no-raw-colors", init, value,
            `Literal colour "${value}" in ${name} bypasses the token system.${suggestColor(value)}`
          );
        }
      }

      if (!active.has("no-inline-style-values")) continue;
      if (ts.isNumericLiteral(init) && !UNITLESS_STYLE_PROPS.has(name)) {
        report(
          "no-inline-style-values", init, `${name}: ${init.text}`,
          `Inline style ${name}: ${init.text} is a raw dimension. Use a token-backed utility class (p-4, rounded-md, text-sm, …) or var(--…) — the scale exists so agents and humans land on the same values.`
        );
      }
      if (ts.isStringLiteralLike(init) && PX_STRING_RE.test(init.text)) {
        report(
          "no-inline-style-values", init, `${name}: "${init.text}"`,
          `Inline style ${name}: "${init.text}" is a raw dimension. Use a token-backed utility class or var(--…).`
        );
      }
    }
  };

  // Only names imported *from the design system* are checkable. Locally-defined
  // and third-party components are out of scope. The rule is gated on
  // catalogComplete: firing against a partial catalog would flag correct code.
  const catalogNames = new Set((contract.catalog ?? []).map((c) => c.name));
  const canCheckComponents = contract.catalogComplete === true && catalogNames.size > 0;
  const fromSystem = (spec) =>
    (contract.systemImports ?? []).some((s) => spec === s || spec.startsWith(s + "/"));

  const visit = (node) => {
    // strings & templates (skip import/export specifiers — they're module paths)
    if (ts.isStringLiteralLike(node)) {
      const p = node.parent;
      const isModulePath =
        (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) && p.moduleSpecifier === node;
      // <a href="#fade"> and <use href="#fade"> are references, not colours.
      const attr = ts.isJsxAttribute(p) ? p.name.getText(sf)
        : ts.isJsxExpression(p) && p.parent && ts.isJsxAttribute(p.parent) ? p.parent.name.getText(sf)
        : null;
      if (!isModulePath) checkText(node, node.text, { idRefContext: ID_REF_ATTRS.has(attr) });
    } else if (ts.isTemplateExpression(node)) {
      checkText(node.head, node.head.text);
      for (const span of node.templateSpans) checkText(span.literal, span.literal.text);
    }

    // raw intrinsic elements the catalog replaces
    if (
      active.has("no-raw-elements") &&
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      /^[a-z]/.test(node.tagName.text)
    ) {
      const tag = node.tagName.text;
      if (tag in contract.intrinsics) {
        const replacement = contract.intrinsics[tag];
        report(
          "no-raw-elements", node, `<${tag}>`,
          replacement
            ? `Raw <${tag}> is banned here. Use <${replacement}> from ${contract.system} — see CATALOG.md for when it applies.`
            : `Raw <${tag}> has no system equivalent yet. Don't hand-roll one — propose a component (agents propose, humans ratify).`
        );
      }
    }

    // …and the same element reached without JSX. Once <button> is blocked,
    // React.createElement("button") is the next thing an agent reaches for; it
    // renders exactly the same raw element.
    if (
      active.has("no-raw-elements") &&
      ts.isCallExpression(node) &&
      /(^|\.)createElement$/.test(node.expression.getText(sf)) &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      const tag = node.arguments[0].text;
      if (tag in contract.intrinsics) {
        const replacement = contract.intrinsics[tag];
        report(
          "no-raw-elements", node, `createElement("${tag}")`,
          replacement
            ? `createElement("${tag}") renders the same raw <${tag}> that JSX would. Use <${replacement}> from ${contract.system} — see CATALOG.md for when it applies.`
            : `createElement("${tag}") renders a raw <${tag}> with no system equivalent. Don't hand-roll one — propose a component (agents propose, humans ratify).`
        );
      }
    }

    // foreign UI imports
    if (
      active.has("no-foreign-ui-imports") &&
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const spec = node.moduleSpecifier.text;
      if (contract.foreignUi.some((f) => spec === f || spec.startsWith(f))) {
        report(
          "no-foreign-ui-imports", node.moduleSpecifier, spec,
          `UI import "${spec}" is outside the design system. All UI comes from ${contract.system}; if it's missing a component, propose one.`
        );
      }
    }

    // component names imported from the system that the catalog doesn't have
    if (
      active.has("no-unknown-components") &&
      canCheckComponents &&
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      fromSystem(node.moduleSpecifier.text) &&
      node.importClause &&
      !node.importClause.isTypeOnly &&                 // `import type { … }`
      node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      for (const el of node.importClause.namedBindings.elements) {
        if (el.isTypeOnly) continue;                   // `import { type X }`
        const imported = (el.propertyName ?? el.name).getText(sf);
        // Only PascalCase names can BE components, so only they can be checked.
        // The catalog is built by resolvePackageComponents, which collects
        // PascalCase names ONLY — so a hook or lowercase utility (`useToast`,
        // `proportional`, `pixel`, `cn`) can never be in it, however real an
        // export it is. Checking them isn't a stricter rule, it's a guaranteed
        // false positive — and this rule BLOCKS the edit while telling the
        // agent the export doesn't exist, pushing it to abandon correct code
        // and declare a bogus gap. A false positive here is worse than a miss.
        if (!/^[A-Z]/.test(imported)) continue;
        if (!catalogNames.has(imported)) {
          report(
            "no-unknown-components", el, imported,
            `${imported} does not exist in ${contract.system}. ` +
            `Check the catalog for the right component, or declare a gap if nothing fits.`
          );
        }
      }
    }

    // inline style objects — visited when either rule that reads them is on;
    // each check inside is guarded by its own rule.
    if (
      (active.has("no-inline-style-values") || active.has("no-raw-colors")) &&
      ts.isJsxAttribute(node) &&
      node.name.getText(sf) === "style" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression &&
      ts.isObjectLiteralExpression(node.initializer.expression)
    ) {
      checkStyleObject(node.initializer.expression);
    }

    ts.forEachChild(node, visit);
  };
  visit(sf);

  // gateSource stays array-returning (every caller and test treats it as one);
  // the exemptions ride along as a non-enumerable property so deep-equality
  // against a plain array still holds. Use gateSourceWithGaps for the object form.
  Object.defineProperty(violations, "exemptions", {
    value: exemptions, enumerable: false, writable: true, configurable: true,
  });
  return violations;
}

/**
 * Structured form of `gateSource`, plus gap handling.
 *
 * Exemptions are invisible violations — "0 violations, 14 exemptions" is not a
 * clean run, so they are surfaced explicitly rather than silently swallowed.
 *
 * Gaps are a success state in the dev loop (spec P3): a declared absence is the
 * agent refusing to improvise, and penalising it would push the agent straight
 * back into drift. But a gap cannot ship, so `strict` (release/CI) promotes it
 * to a violation. Invalid gaps — the thing exists, or no reason was given —
 * always fail, in both modes: honesty is not optional.
 */
export function gateSourceWithGaps(source, { strict = false, ...opts } = {}) {
  const violations = gateSource(source, opts);
  const gaps = findGaps(source, { fileName: opts.fileName, contract: opts.contract });

  for (const g of gaps) {
    if (!g.valid) {
      violations.push({
        rule: "invalid-gap", line: g.line, column: 1, found: g.what, message: g.message,
      });
    } else if (strict) {
      violations.push({
        rule: "unresolved-gap", line: g.line, column: 1, found: g.what,
        message: `Unresolved gap "${g.what}" cannot ship. Resolve it in triage (add to the system, replace with an existing component, or grant an exemption).`,
      });
    }
  }

  return {
    violations,
    exemptions: violations.exemptions ?? [],
    gaps: gaps.filter((g) => g.valid),
  };
}

/**
 * Gate a list of LITERAL file paths. `gateFiles` globs its patterns, which
 * silently drops any path containing fast-glob syntax — `(marketing)`,
 * `[slug]`, `{a,b}`. Those are ordinary directory names in Next.js and Remix
 * apps, so globbing already-resolved paths quietly under-reports real drift.
 */
export function gatePaths(files, { rules = ALL_RULES, contract, strict = false }) {
  const results = [];
  const exemptions = [];
  const allGaps = [];
  const declarations = { total: 0, resolved: 0 };
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const { violations, exemptions: fileExemptions, gaps } = gateSourceWithGaps(source, {
      fileName: file, rules, contract, strict,
    });
    for (const v of violations) results.push({ ...v, file });
    for (const e of fileExemptions) exemptions.push({ ...e, file });
    for (const g of gaps) allGaps.push({ ...g, file });
    const d = countDeclarations(source, { fileName: file, contract });
    declarations.total += d.total;
    declarations.resolved += d.resolved;
  }
  return { files: files.length, violations: results, exemptions, gaps: allGaps, declarations };
}

/** Run the gate over files (paths or globs, resolved against contract.root). */
export function gateFiles(patterns, { rules = ALL_RULES, contract, strict = false }) {
  const files = fg.sync(patterns, { cwd: contract.root, absolute: true, dot: false });
  return gatePaths(files, { rules, contract, strict });
}

// The published metric (spec §8). A "style declaration" is any place a visual
// value is set: an inline style property, or a utility class carrying a value.
// "Resolved" means it came from the token system rather than a literal.
// Layout-only utilities (flex, items-center) carry no value and are not counted —
// counting them would inflate the denominator and flatter the score.

// Exported: single-source.mjs (dimension 2) needs the SAME "is this Tailwind
// class value-carrying, and is it the scale form or the arbitrary form"
// vocabulary this metric already uses — a byte-copy would drift the moment
// either list changes here without the other noticing.
export const VALUE_UTILITY_RE =
  /^(bg|text|border|ring|fill|stroke|shadow|from|via|to|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|w|h|min-w|min-h|max-w|max-h|rounded|leading|tracking)(-|$)/;
export const ARBITRARY_UTILITY_RE = /-\[[^\]]+\]/;

export function countDeclarations(source, { fileName = "input.tsx", contract }) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const tokens = contract.tokens ?? {};
  let total = 0, resolved = 0;

  const countClassName = (text) => {
    for (const cls of text.split(/\s+/).filter(Boolean)) {
      if (!VALUE_UTILITY_RE.test(cls)) continue;   // layout-only → not a declaration
      total++;
      if (!ARBITRARY_UTILITY_RE.test(cls)) resolved++;  // scale utility → token-backed
    }
  };

  const countStyleObject = (obj) => {
    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = prop.name.getText(sf).replace(/['"]/g, "");
      const init = prop.initializer;
      if (ts.isNumericLiteral(init) && UNITLESS_STYLE_PROPS.has(name)) continue;
      total++;
      if (ts.isStringLiteralLike(init)) {
        const m = init.text.match(/var\(\s*(--[A-Za-z0-9_-]+)/);
        if (m && m[1] in tokens) resolved++;
      }
    }
  };

  const visit = (node) => {
    if (ts.isJsxAttribute(node) && node.initializer) {
      const attr = node.name.getText(sf);
      if (attr === "className" || attr === "class") {
        if (ts.isStringLiteral(node.initializer)) countClassName(node.initializer.text);
        else if (ts.isJsxExpression(node.initializer) && node.initializer.expression &&
                 ts.isStringLiteralLike(node.initializer.expression)) {
          countClassName(node.initializer.expression.text);
        }
      }
      if (attr === "style" && ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isObjectLiteralExpression(node.initializer.expression)) {
        countStyleObject(node.initializer.expression);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  return { total, resolved };
}

/** Compliance as a percentage. Empty source is vacuously 100%. */
export function compliance({ total, resolved }) {
  return total === 0 ? 100 : Math.round((resolved / total) * 1000) / 10;
}

/** Resolve which profile applies and run it. */
export function gateProfile(profileName, { contract, extraPatterns = [], strict = false }) {
  const profile = contract.profiles[profileName];
  if (!profile) {
    throw new Error(
      `Unknown profile "${profileName}". Available: ${Object.keys(contract.profiles).join(", ") || "(none configured)"}`
    );
  }
  const patterns = extraPatterns.length ? extraPatterns : profile.include;
  return gateFiles(patterns, { rules: profile.rules ?? ALL_RULES, contract, strict });
}
