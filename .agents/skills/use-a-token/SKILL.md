---
name: Use a token
description: Find the token for the job and use it through its utility, never a raw value. Trigger when editing any file that carries a style, a class string or a colour.
---

# Use a token

Every visual value is a token (`CONVENTIONS.md`, "Every visual value is a token"). The token layer at a glance is `packages/tokens/FOUNDATIONS.md`, generated from the source on every build.

## Which token

| Job | Token | Utility |
|---|---|---|
| A surface and the text on it | a role pair such as `color.semantic.card` and `color.semantic.card-foreground` | `bg-card text-card-foreground` |
| A status | `success`, `warning`, `danger`, `info`, each with a `-subtle` surface | `bg-success-subtle text-success` |
| The page inset | `layout.page.inset` | `p-page-inset`, or use `Page` |
| Space between groups in a section | `layout.section.gap` | `gap-section-gap`, or `Stack gap="section"` |
| Space between controls | `layout.group.gap` | `gap-group-gap`, or `Stack` |
| A label and its control | `layout.control.gap` | `gap-control-gap`, or `Stack gap="control"` |
| Elevation | `shadow.semantic.card`, `shadow.semantic.popover`, `shadow.semantic.dialog` | `shadow-card`, `shadow-popover`, `shadow-dialog` |
| Radius | `dimension.radius.md` and its siblings | `rounded-md` |

## What rejects a raw value

`no-hardcoded-values.test.ts` in the components package, and the gate rules `no-raw-colors`, `no-arbitrary-values` and `no-inline-style-values`. The `PostToolUse` hook in `.claude/settings.json` runs the gate on every file written, so a raw value comes back as an error naming the fix.

## When no token fits

That is a token proposal, a design decision under `AGENTS.md` rule 2. Render `<Missing what="…" reason="…" />` rather than improvising a value; `undrift triage` ranks the gaps into what the system should add next.
