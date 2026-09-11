---
name: Grid
slug: grid
status: stable
version: 0.1.0
lastUpdated: 2026-09-08
---

## Overview

`Grid` lays children out in columns that collapse. `min` names the narrowest a column may become, from the layout scale (`xs` a stat tile, `sm` a card, `md` a form group, `lg` a panel), and the columns are `repeat(auto-fit, minmax(min, 1fr))`. There is no column count and no breakpoint to guess: the grid is responsive by construction.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `"xs" \| "sm" \| "md" \| "lg"` | `"sm"` | The column minimum, from `layout.grid.min.*`. |
| `gap` | `"page" \| "section" \| "group" \| "control"` | `"group"` | The layout token between cells. |

Plus every `<div>` prop.

## For / Not for

**Use when:**
- Cards, tiles or panels that should sit side by side where there is room and stack where there is not.

**Do NOT use when:**
- Tabular data with rows and columns that must line up: `Table` or `DataTable`.
- A single column of controls: `Stack`.
- A fixed two-pane layout that must never collapse (a sidebar): `AppShell` owns that.

## Best practices

**Do: pick `min` by what a cell is.** A card is `sm`. Choosing by how many columns look right on one screen is the mistake the prop exists to prevent.

**Don't: give cells fixed widths.** A cell with a width fights the minimum and overflows on a narrow screen.

**Do: use the same `gap` inside and outside.** A grid of cards inside a section takes `group`; the section around it already carries `section`.

**Don't: reach for a fixed `grid-cols-*` utility on a cell's parent.** It is not exported from this component for a reason.

**Do: keep cells the same kind of thing.** A grid of four cards reads; a grid of a card, a table and a form does not.

## Accessibility

- A grid is a styling container; CSS grid order matches DOM order, so keyboard and reading order are the visual order.

## Quality checklist

- [x] Accessibility: DOM order is visual order, stated
- [x] Token-only styling: `grid-auto-*` utilities read `layout.grid.min.*`; gaps are `layout.*` (gate: `no-hardcoded-values.test.ts`)
- [x] Types: `grid.test-d.ts` rejects a number, a pixel string and a column count
- [x] Tests: defaults, every minimum, no fixed column count (`grid.test.tsx`)
- [x] Storybook: `grid.stories.tsx`
- [x] Docs: this file; entry in `CATALOG.md`; a row in `COMPOSITION.md`
