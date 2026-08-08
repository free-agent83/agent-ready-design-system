**A code-first design system, shared as a sample of a standard.**

Correct UI is the default output here rather than something a review has to catch. Styling comes only from tokens, the legal range of every component is a compile-time type, and the rules are enforced by a hook while an agent writes, not documented and hoped for.

[`examples/specimen-report.html`](examples/specimen-report.html) is the other half: an assessment of a real third-party design system at a stated commit, showing the same standard applied to a codebase built under delivery pressure rather than to this one. [`examples/README.md`](examples/README.md) explains how to read it.

Chris Learey. Shared for evaluation, see [LICENCE.md](LICENCE.md).

---

# correct-by-design

A small, code-first design system. It packages DTCG design tokens and React components so that correct UI is the default output, not something that requires per-component design review.

The system is built as an Nx workspace with two packages (`@cbd/tokens`, `@cbd/components`) and one app (`apps/web`, a Next.js App Router dashboard that consumes the components). Node 20+ is required.

---

## Build and run

```bash
npm install
npm run build:tokens       # compile token source → CSS / JS / JSON in packages/tokens/dist/
npm run dev                # builds tokens first, then starts apps/web (Next.js, :5200)
```

**Storybook** (component explorer):
```bash
cd packages/components
npx storybook dev -p 6006
```

**Tests:**
```bash
npm test                   # token tests + component tests + TypeScript type-check
npm run test:storybook     # Storybook test-runner (requires a served Storybook + browser)
```

**Token tests only:**
```bash
cd packages/tokens
npx vitest run
```

**Blast-radius demo** (proves one token edit propagates everywhere):
```bash
npm run blast-radius
```

---

## How to read this codebase

**AI agents: read `AGENTS.md` first** — it is the short rulebook and a map of where everything lives (Claude Code picks it up via `CLAUDE.md`, which just imports it). **Adding or changing a component? read `CONTRIBUTING.md`** — the build manual and definition of done.

To pick a component, start at `packages/components/CATALOG.md`. It is a one-table index of every component: what it is for and what it is explicitly not for. Read it first so you reach for the right component without having to open source files.

For a specific component, open `packages/components/src/components/<atom|molecule>/<name>/COMPONENT.md`. It contains props, for/not-for guidance, best practices, and a quality checklist. The corresponding `<name>.tsx` is the implementation; `<name>.stories.tsx` is the living documentation in Storybook.

For token decisions, see `docs/architecture/architecture.md`.

---

## How the system works

### Token pipeline

Token source files live in `packages/tokens/src/`:

- `primitive/` — raw values: the Clean Slate colour ramps (`slate`, `indigo`, `red`, plus `emerald`/`amber`/`blue` for status) in OKLCH, the dimension + radius scale, the type scale, and the elevation (`box-shadow`) scale. Every `src/primitive/*.tokens.json` is discovered automatically and mapped to CSS custom properties in `:root`.
- `theme/<name>/light.tokens.json` and `dark.tokens.json` — semantic token files that map roles (the shadcn vocabulary: `background`, `foreground`, `primary`, `card`, `popover`, `muted`, `accent`, `destructive`, the `success`/`warning`/`danger`/`info` status roles, `chart-1..5`, and the `card`/`popover`/`dialog` elevation roles) to primitive references via `{dotted.path}` syntax.

Running `node build.mjs` (or `npm run build:tokens`) does five things in order: loads all source files, validates every reference resolves to an existing primitive, flattens primitives into a `:root` block, flattens each theme's semantic tokens into `[data-theme="<name>"]` (light) and `[data-theme="<name>"].dark` (dark) blocks, and writes three output formats: `dist/web/tokens.css`, `dist/js/tokens.js`, `dist/json/tokens.json`.

### Theme slots

There are three theme slots:

| Theme | Status | Description |
|-------|--------|-------------|
| `default` | Built | Light and dark modes fully authored. Every text pair clears WCAG AA (4.5:1). This is the theme the app and components use. |
| `contrast` | Built | A high-contrast alternative, light and dark. Every text pair clears WCAG AAA (7:1). Switch to it by setting `data-theme="contrast"`. |
| `portfolio` | Placeholder | Source files exist but are empty. The build skips empty themes, so no CSS is emitted for it. |

`contrast` is a real second theme rather than a demonstration of one: it is authored entirely in its own token files and needed no change to any component, which is the property the multi-theme architecture exists to have. `portfolio` remains an empty slot, and the build's behaviour for an unauthored theme is enforced by a test.

### Contrast is enforced, not audited

`packages/tokens/tests/contrast.test.mjs` derives every surface-and-text pair from the token names, resolves both sides to real colours, and fails the build if a pair falls below the ratio its theme promises: AA for `default`, AAA for `contrast`. A new status role is covered the day it is added, because the pairs come from the tokens rather than from a list someone maintains.

This is deliberately the same shape as the rest of the system. Unreadable text is not something to catch in review; it is something a binding cannot express. The gate found three real failures on its first run, all in the default light theme, each of which passed for large text and failed for body text.

Contrast is the only accessibility property that can be settled in the token layer, because it depends on nothing but the two colours. Everything needing a rendered tree (accessible names, roles, ARIA) is gated in `packages/components/tests/a11y.test.tsx`, which runs axe over every story.

### Runtime theme switching

Themes are switched by setting `data-theme` on a root element and toggling the `.dark` class:

```html
<!-- light -->
<html data-theme="default">

<!-- dark -->
<html data-theme="default" class="dark">
```

The token CSS uses `[data-theme="default"]` and `[data-theme="default"].dark` selectors. Tailwind's `@custom-variant dark` variant is wired to `.dark` (not `prefers-color-scheme`), so `dark:` utility classes respond to the class toggle. The app's theme toggle (which sets `.dark` from a server-read cookie) demonstrates this.

### How components consume tokens

`packages/components/tailwind.css` maps CSS custom properties from the token layer to Tailwind theme variables using `@theme inline`. The `inline` keyword is essential: it tells Tailwind to emit `var(--color-background)` in utility classes rather than resolving the variable to a static value at build time. Without `inline`, runtime token overrides would have no effect on compiled utility classes.

### Enforced quality gates

Six automated checks run on every `npm test`:

- **Type-level gate** — `tsc --noEmit` verifies that component prop types are exactly what they claim to be. Off-brand prop values are rejected at compile time.
- **Behavioral gate** — Vitest + Testing Library exercises DOM structure (disabled state, `asChild` rendering, attribute propagation).
- **No-hardcoded-values gate** — a static analysis test rejects any component source file that contains raw pixel values or hex colour literals not annotated with `token-exempt`. All values must come from the token layer.
- **Docs-coverage gate** — every component source file must have a sibling `COMPONENT.md`. Stable components must have no unchecked quality-checklist boxes.
- **Contrast gate** — every surface-and-text token pair is resolved to real colours and measured. Below the ratio its theme promises (AA for `default`, AAA for `contrast`), the build fails. See "Contrast is enforced, not audited" above.
- **Accessibility gate** — axe runs over every story of every component, catching missing accessible names, bad roles and ARIA, unlabelled controls and duplicate ids. It states its own limits: jsdom has no layout, so colour-contrast and target-size are disabled by name rather than passing silently, and stories are rendered but not played, so anything behind an interaction is out of its reach.

These run in CI as well as locally (`.github/workflows/ci.yml`), alongside `undrift gate --strict` and a production build, so the contract holds for a change made in any editor rather than only inside an agent's loop.

There is also a real-browser theme cascade proof in the `ThemeProof` Storybook story (run via `test:storybook`): it toggles `.dark` in a real browser and asserts that the button's computed background colour changes. This is the end-to-end proof that the token → Tailwind `@theme inline` → runtime cascade is working.

Pixel-diff visual regression testing is not in place at this stage. See `docs/architecture/architecture.md` (ADR 4) for the boundary.

### Enforcement while the code is being written

The gates above run when you ask for them. This one does not wait to be asked.

`.claude/settings.json` registers `packages/undrift/hooks/undrift-hook.mjs` as a
`PostToolUse` hook, so **it is already active in this repository**. Every file an
AI agent writes or edits is checked the instant it is written, before the agent
moves on. A clean file passes silently. A file that breaks the contract is
rejected, and the reason goes back to the agent as an error it has to act on:

```
undrift blocked this edit — 1 violation(s) in apps/web/app/page.tsx (attempt 1/3):
  line 2: Raw colour #e0481e bypasses the token system. Nearest token:
          --color-primitive-red-500 — use its semantic utility or
          var(--color-primitive-red-500).
Fix these and rewrite the file. If the design system genuinely cannot serve
this, use <Missing what="…" reason="…" /> instead of improvising.
```

Point an agent at this repository and ask it to build a screen. You do not have
to tell it the rules, and you do not have to trust that it read them. Drift does
not land, so nobody has to catch it in review.

After three failed attempts on the same file the hook stops asking for a fix and
asks for a **decision** instead, so enforcement can never trap an agent in a
loop. When the system genuinely lacks something, the honest move is to declare
it with `<Missing />` rather than improvise. Declared gaps pass the dev loop by
design; they are a success state, not a failure.

To check the same rules by hand at any time:

```bash
npm run gate
```

`.undrift/` holds the attempt counters and is git-ignored. Remove
`.claude/settings.json` to turn write-time enforcement off and rely on
`npm run gate` alone.

---

## Package layout

```
AGENTS.md / CLAUDE.md   agent rulebook + map (CLAUDE.md imports AGENTS.md)
CONTRIBUTING.md         how to add a component + governance
README.md               this file
packages/
  tokens/
    src/
      primitive/          DTCG source: colours, dimensions, type
      theme/
        default/          light.tokens.json + dark.tokens.json (built)
        contrast/         high-contrast theme (AAA), light + dark
        portfolio/        stubs (not yet built)
    lib/                  build utilities (resolve.mjs, emit.mjs, color.mjs)
    dist/                 generated output — do not edit
    build.mjs             build entry point
    tests/                12 tests covering the build pipeline
  components/
    src/
      components/
        atoms/button/     Button (reference component)
    tailwind.css          Tailwind v4 theme wiring
    CATALOG.md            component index (pick a component here)
apps/
  web/                    Next.js App Router dashboard (Overview + Users screens)
scripts/
  blast-radius.mjs        shows token propagation across all outputs
docs/
  architecture/           ADRs
```

---

## An example assessment

`examples/` holds a real assessment of a third-party design system: Plane, the
open-source project management tool, scored at a stated commit. Open
`examples/specimen-report.html` in a browser, and read `examples/README.md` for
what it is and how to read it.

It is there because a design system that only ever demonstrates itself proves
very little. The interesting question is not whether this repository is
consistent, it is what happens when the same standard is applied to a codebase
that was built under real delivery pressure.

## Licence

Shared for evaluation. See [`LICENCE.md`](LICENCE.md).
