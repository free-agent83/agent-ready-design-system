---
name: Pick a page template
description: Decide what kind of screen this is before building it, then build it inside `Page` from the layout primitives rather than inventing chrome. Trigger when creating a page or route under `apps/web/app/`.
---

# Pick a page template

Before writing a screen, answer one question: what page type is this? Then reach for the shape that type takes. The shapes are made of `Page`, `Section`, `Stack` and `Grid` (see `packages/components/COMPOSITION.md`); inventing a frame from raw containers is the thing this skill exists to stop.

## Page types

| Type | Shape | Status |
|---|---|---|
| Settings | `Page` with `PageHeader`, then one `Section surface` per group of settings, `Stack` inside each, `PageActions` carrying the save. | Built by hand: the reference is `apps/web/app/(dashboard)/notifications/page.tsx`. A kit is planned. |
| List | `Page` with `PageHeader` (title, count, search, actions), then `DataTable`, then an empty state and pagination. | Built by hand: the reference is `apps/web/app/(dashboard)/users/page.tsx`. A kit is planned. |
| Detail | `PageHeader` with breadcrumb and a primary action, a content area for the one item. | Not built. Use `Page` and `Section` directly and lay out the body with `Stack` and `Grid`. |
| Workflow | A multi-step flow. | Not built. Do not force it into a settings shape. |

## The rules the shape must keep

Every rule in `packages/components/COMPOSITION.md`, in particular: the screen sits inside one `Page` (content never touches the viewport edge); sections are `Section` with a `SectionTitle`; spacing comes from `Stack` gaps and `Grid` minimums, never from a margin or a pixel; the outline is `PageTitle`, then `SectionTitle`, then `CardTitle`.

## When the type is none of these

Say so in the proposal rather than picking the nearest one. `AGENTS.md` rule 2: propose, get a ruling, then build.
