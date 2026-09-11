---
name: Compose a screen
description: Put components together on a screen so the result holds the compositional contract by construction. Trigger when assembling two or more components into a page or panel.
---

# Compose a screen

`packages/components/COMPOSITION.md` is the contract. Every rule in it names the token or export it is expressed in, so composing correctly is mostly a matter of using the right primitive and letting its default do the work.

## The order

1. `Page` around everything. The inset cannot be zeroed; that is the guarantee.
2. `PageHeader` with `PageTitle` (the `<h1>`), a `PageDescription`, and the page-level actions in `PageActions`.
3. One `Section` per top-level group, with a `SectionTitle` (the `<h2>`). `surface` when the group is a distinct unit.
4. Inside a section, `Stack` for rhythm (`section` between groups, `group` between controls, `control` between a label and its control) and `Grid` for cells that should sit side by side and collapse.
5. `Card` for a single unit inside a section, with `CardTitle` (the `<h3>`).

## What never appears

A margin to space two things. A pixel value. A `grid-cols-3`. A `div` doing `Page`'s job. A bold paragraph doing a heading's job.

## Before saying it is done

Answer the six questions at the foot of `packages/components/COMPOSITION.md` against the rendered screen at 390px, 768px and 1280px. Six no's is conformance; any yes is a finding, and it attributes to one of three causes (the rule was not followed, the primitive is missing, the primitive's default is wrong).
