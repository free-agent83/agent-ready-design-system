---
name: Stack
slug: stack
status: stable
version: 0.1.0
lastUpdated: 2026-09-08
---

## Overview

`Stack` puts rhythm between things. Its `gap` is typed as the names of the layout tokens (`page`, `section`, `group`, `control`), so spacing can only come from the scale: a number or a pixel string does not compile. Vertical by default; `direction="horizontal"` with `align` and `wrap` for a row of controls.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `"page" \| "section" \| "group" \| "control"` | `"group"` | The layout token between children. |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | Column or row. |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | none | Cross-axis alignment. |
| `wrap` | `boolean` | `false` | Let a horizontal stack wrap. |

Plus every `<div>` prop.

## For / Not for

**Use when:**
- Spacing a label from its control (`gap="control"`), controls within a group (`group`), or groups within a section (`section`).
- A row of actions (`direction="horizontal"`).

**Do NOT use when:**
- Laying out cards or tiles in columns that should collapse on narrow screens: that is a `Grid`.
- Separating top-level sections: `Page` already does that with `layout.page.gap`.
- Dividing content with a rule: `Separator`.

## Best practices

**Do: pick the gap by what the children are, not by how it looks.** A label and its input are `control`; two inputs are `group`; two groups are `section`. The names are the decision.

**Don't: add margins to a stack's children.** The stack owns the rhythm; a margin fights it and drifts.

**Do: nest stacks with descending gaps.** `section` outside, `group` inside, `control` innermost. The outline of the spacing then matches the outline of the content.

**Don't: use a stack for a single child.** It spaces nothing; reach for it when there are two or more.

**Do: `wrap` a horizontal stack of actions.** On a narrow screen an unwrapped row overflows, which is the boundary failure `Page` exists to prevent.

## Accessibility

- A stack is a styling container with no semantics of its own. Group semantics (a `fieldset`, a `role="group"` with a name) belong on the child that needs them.

## Quality checklist

- [x] Accessibility: no semantics claimed, none needed
- [x] Token-only styling: every gap is a `layout.*` utility (gate: `no-hardcoded-values.test.ts`)
- [x] Types: `stack.test-d.ts` rejects a number, a pixel string and an unknown name
- [x] Tests: default gap, every gap's utility, direction and alignment (`stack.test.tsx`)
- [x] Storybook: `stack.stories.tsx`, vertical and horizontal
- [x] Docs: this file; entry in `CATALOG.md`; a row in `COMPOSITION.md`
