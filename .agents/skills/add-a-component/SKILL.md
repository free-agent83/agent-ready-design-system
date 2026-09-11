---
name: Add a component
description: The house shape for a new component and the gates that check it. Trigger when creating a file under `packages/components/src/components/`.
---

# Add a component

The reference is `packages/components/src/components/button/`. Copy what Button does. The full manual is `CONTRIBUTING.md`; this is the short form.

## The five files

One flat directory, `packages/components/src/components/<name>/`:

1. `<name>.tsx`: the implementation. Token-only styling through the utilities `packages/components/tailwind.css` maps.
2. `<name>.test-d.ts`: the type-level gate. An illegal prop must not compile (`@ts-expect-error`), a legal set must.
3. `<name>.test.tsx`: the behavioural gate, with `@testing-library/react`.
4. `<name>.stories.tsx`: CSF3 stories for every variant, titled `<Group>/<Name>` where the group is the component's section in `packages/components/CATALOG.md`.
5. `COMPONENT.md`: the colocated doc, every quality-checklist box checked for `status: stable`, with a for and a not-for that names the neighbour to use instead.

Then a row in `packages/components/CATALOG.md` under the section for what the component is for, and a barrel export in `packages/components/src/index.ts`.

## What checks it

`docs-coverage.test.ts` (a `COMPONENT.md` per component, no unchecked boxes), `no-hardcoded-values.test.ts`, `a11y.test.tsx` (axe over every story), `story-group-is-catalogue-group.test.ts` (the story's group is the catalogue's), `test:types`, and the gate's `system` profile. Run `npm test` from the repository root.

## What not to do

Do not add a tier, a pattern or a second documentation format. A component is anything that renders under `src/components`; composing several is not a different kind of thing.
