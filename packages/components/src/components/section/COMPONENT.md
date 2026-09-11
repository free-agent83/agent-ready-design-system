---
name: Section
slug: section
status: stable
version: 0.1.0
lastUpdated: 2026-09-08
---

## Overview

`Section` is a top-level group inside a `Page`. It separates the groups within it by `layout.section.gap`, and with `surface` it sits on the card surface with the section inset, border and elevation applied together, so a section is never on a surface without padding. `SectionHeader`, `SectionTitle` (an `<h2>`) and `SectionDescription` give it a heading that falls correctly between the page's `<h1>` and any card's `<h3>`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `surface` | `boolean` | `false` | Sit the section on its own surface: `bg-card`, border, `shadow-card`, `p-section-inset`. |

Plus every `<section>` prop.

## Parts

| Part | Element | Description |
|------|---------|-------------|
| `Section` | `section` | The group. `gap-section-gap` between children. |
| `SectionHeader` | `div` | Title and description, spaced by `layout.control.gap`. |
| `SectionTitle` | `h2` | The section's heading. |
| `SectionDescription` | `p` | One line under the title. |

## For / Not for

**Use when:**
- Grouping related settings, a form area, or a block of content that has its own heading.
- The group should read as a distinct unit: add `surface`.

**Do NOT use when:**
- The unit is a single tile, a stat or a summary: that is a `Card` (an `<h3>` inside a section).
- The content is a floating panel or a modal task: `Popover` or `Dialog`.
- Two controls need spacing between them and nothing more: that is a `Stack`.

## Best practices

**Do: give every section a `SectionTitle`.** A section without a heading is a gap in the outline; the `<h2>` is what makes the page navigable by heading.

**Do: use `surface` when the section is a distinct unit, and leave it off when it is page flow.** A settings group on a card surface reads as a unit; body prose does not need one.

**Don't: nest a `Section surface` inside another `Section surface`.** Elevation never nests; the inner one reads as noise. Use a plain `Section` or a `Stack` inside.

**Don't: put a `Card` inside a `Section surface` as its only child.** That is two surfaces for one unit. Pick one.

**Do: let the section own the gap between its groups.** Children need no margins; `layout.section.gap` is the rhythm.

## Accessibility

- **Landmark:** `<section>` is only a landmark when it has an accessible name. Give it `aria-labelledby` pointing at its `SectionTitle`'s `id` when the section should appear in a landmarks list.
- **Heading order:** `<h2>` under the page's `<h1>`.
- **Contrast:** the `card`/`card-foreground` pair is validated for AA in the token layer.

## Quality checklist

- [x] Accessibility: landmark naming and heading order stated
- [x] Token-only styling: `gap-section-gap`, `p-section-inset`, the card surface roles (gate: `no-hardcoded-values.test.ts`)
- [x] Types: `surface` is a boolean; `section.test-d.ts` rejects a string
- [x] Tests: plain vs surface classes, h2 semantics (`section.test.tsx`)
- [x] Storybook: `section.stories.tsx`, plain and on its own surface
- [x] Docs: this file; entry in `CATALOG.md`; rows in `COMPOSITION.md`
