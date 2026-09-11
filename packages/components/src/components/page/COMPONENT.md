---
name: Page
slug: page
status: stable
version: 0.1.0
lastUpdated: 2026-09-08
---

## Overview

`Page` is the frame every screen sits in. It guarantees one thing and makes the opposite impossible: content is inset from every viewport edge by `layout.page.inset`, on an outer element that takes no `className` and has no prop to change it. Inside the frame, a centred column carries the page's width ceiling (`layout.page.max`) and the gap between top-level sections (`layout.page.gap`). `PageHeader`, `PageTitle` (an `<h1>`), `PageDescription` and `PageActions` give the page its heading row.

## Parts

| Part | Element | Description |
|------|---------|-------------|
| `Page` | `div` (frame) + `div` (column) | The frame carries the inset and accepts no className. The column takes `className` and every other prop. |
| `PageHeader` | `header` | Title block on the left, actions on the right, wrapping on narrow screens. |
| `PageTitle` | `h1` | The page's heading. One per page. |
| `PageDescription` | `p` | One line under the title, on the `muted-foreground` role. |
| `PageActions` | `div` | The page-level actions, spaced by `layout.control.gap`. |

## For / Not for

**Use when:**
- Building any screen. There is no screen that should not be inset from the viewport.
- The screen has a title. Every screen does; `PageTitle` is where the outline starts.

**Do NOT use when:**
- Framing a modal task: use `Dialog`. A dialog is not a page.
- Framing the application chrome (sidebar, header): that is `AppShell`, and `Page` goes inside its content region.
- Nesting: a `Page` inside a `Page` doubles the inset. One per screen.

## Best practices

**Do: put the whole screen inside one `Page`.** The inset only protects content that is inside the frame; a sibling rendered outside it can still touch the edge.

**Do: use `PageTitle` for the heading.** It renders an `<h1>`, so `SectionTitle` (`<h2>`) and `CardTitle` (`<h3>`) fall into a correct outline underneath it.

**Don't: reach for `className` to change the inset.** It cannot. The class lands on the inner column, which is the point. If a screen genuinely needs a different inset, that is a change to `layout.page.inset`, a design decision, not a local override.

**Do: let `Page` own the vertical rhythm.** Its column is a flex column with `layout.page.gap` between children, so top-level sections need no margins of their own.

**Don't: put a `Card` directly in a `Page` as a section.** Use `Section surface`, which sits on the card surface and carries a `SectionTitle` (`<h2>`) so the outline stays correct.

## Accessibility

- **Heading order:** `PageTitle` is the page's single `<h1>`. Sections use `<h2>`, cards `<h3>`.
- **Landmark:** `Page` renders `div`s and is not a landmark; the `<main>` landmark belongs to the application frame (`AppShell`), so two shells never fight over it.
- **Actions:** `PageActions` is a plain group; give a lone icon button an `aria-label`.

## Quality checklist

- [x] Accessibility: heading order stated, landmark ownership stated
- [x] Token-only styling: `p-page-inset`, `gap-page-gap`, `max-w-page-max`, all from `layout.*` (gate: `no-hardcoded-values.test.ts`)
- [x] Types: no `inset` and no `style` prop; `page.test-d.ts` asserts both fail to compile
- [x] Tests: the frame never receives a caller's className; the column carries the tokens; the header renders an h1 (`page.test.tsx`)
- [x] Storybook: `page.stories.tsx`, including the `Page with sections` story `COMPOSITION.md` binds to
- [x] Docs: this file; entry in `CATALOG.md`; a row in `COMPOSITION.md`
