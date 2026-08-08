# AGENTS.md

You are working in a code-first design system. Its purpose: **correct UI is the default output.** The components *are* the design — there is no separate "make it match the mockup" step. Your job is to keep that property true.

This file is the thin rulebook and a map. Read the deeper docs it points to when you actually need them — don't load everything at once.

## The rules that are not yours to break

1. **Token-only styling.** Component source uses Tailwind utilities backed by semantic tokens (`bg-primary`, `text-foreground`, `border-border`, `hover:bg-action`, …). **Never** write a raw hex (`#1f1f1e`) or arbitrary pixel value (`rounded-[8px]`, `min-w-[96px]`) in a component. The `no-hardcoded-values` gate fails the build if you do. (Escape hatch, for genuinely unavoidable cases only: a `// token-exempt: <reason>` comment on the line — but prefer adding a token.)

   **1a. Compose freely; never invent an atom.** If a component doesn't exist but can be built from existing components and tokens, build it — that's not drift, that's the system working. If it needs a token or primitive the system genuinely lacks, render `<Missing what="…" reason="…" />` rather than improvising. Gaps are a success state: they never fail the dev loop, and `undrift triage` ranks them into what the system should add next. Improvising is not.

2. **Don't invent design decisions.** Adding a new token, a new semantic role, a new component pattern, or a new variant is a *design* decision — **propose it and get a human ruling**, don't improvise. Agents propose; humans ratify. Write an ADR only when the decision is a genuine architectural fork with a lasting trade-off (`docs/architecture/architecture.md`); routine additions just need the ruling and a clear commit — don't pad the ADR log.
3. **Every component is fully documented and gated.** A component is not done until it has: a sibling `COMPONENT.md` (every quality-checklist box checked), a row in `CATALOG.md`, type-level + behavioral tests, and a Storybook story. The `docs-coverage` gate enforces the docs; see `CONTRIBUTING.md` for the rest.
4. **Prove it before you claim it.** Run `npm test` (tokens + components + type-check + undrift) and make it green before saying a task is done. For anything touching theming, also `npm run test:storybook`. To check just your UI code against the system's contract, `npm run gate` (see `packages/undrift/`) — its error messages name the exact fix.

   **You are already being checked.** `.claude/settings.json` registers a `PostToolUse` hook, so every file you write here is gated the instant you write it. Clean files pass silently; a violation comes back as an error naming the exact fix, and you must resolve it before moving on. After three failed attempts on one file it asks for a decision instead of a fix (a declared gap or an explained exemption), so you are never trapped. Don't work around it: rule 1a is the way through.
5. **Commit in small, logical units** with Conventional Commit messages.

## Where everything lives

- `packages/tokens/` — the token source of truth. `src/primitive/` (raw OKLCH colours, dimensions, type) and `src/theme/<name>/{light,dark}.tokens.json` (semantic roles). `build.mjs` compiles these to `dist/web/tokens.css` (+ js/json). **Never edit `dist/`.**
- `packages/components/` — React components (cva + Radix + Tailwind v4). `tailwind.css` wires tokens into Tailwind via `@theme inline`. `tests/` holds the cross-component gates.
- `apps/web/` — the Next.js (App Router) dashboard: a branded, client-facing demo (sidebar + header + live theme toggle) that consumes `@cbd/components` and dogfoods the tokens.
- `scripts/blast-radius.mjs` — demonstrates one token edit propagating everywhere.

## Where to go next

- **To pick the right component:** `packages/components/CATALOG.md` (the index — for / not-for).
- **To use a specific component:** its `COMPONENT.md` (props, best practices, a11y).
- **To add or change a component, or touch tokens:** `CONTRIBUTING.md` (the build manual + definition of done). Read this before writing any component code.
- **To understand a decision:** `docs/architecture/architecture.md` (ADRs).
- **To build/run/test:** `README.md`.

The reference component is **Button** (`src/components/atoms/button/`). When in doubt about a convention, copy what Button does.
