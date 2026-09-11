# Conventions

The rules that hold across the whole system, harvested from where they were buried: each of the do and don't lines in the component docs that turned out to be about every component, not one. `AGENTS.md` rule 2 forbids inventing a design decision without stating what the decisions already are. This is where they are stated.

Every convention carries its enforcement, and says so plainly when there is none. That line is the difference between a rule and advice: `tests/conventions-enforcement.test.ts` fails the build if a convention names a gate that does not exist, so nothing here can claim a check it does not have. Read the split honestly. A rule marked **not enforced** is one an agent has to hold by judgement, and a review has to catch.

The layout rules live in `packages/components/COMPOSITION.md`, each bound to a token or an export, and are not repeated here. The token layer is rendered in `packages/tokens/FOUNDATIONS.md`.

## Styling

### Every visual value is a token

Colour, spacing, radius, elevation and type come from the token layer through the Tailwind utilities `tailwind.css` maps them to. A raw hex, a raw pixel value, an arbitrary utility or an inline style value is a defect, not a shortcut.

**Enforced by:** `no-hardcoded-values.test.ts` in the components package, and `no-raw-colors`, `no-arbitrary-values` and `no-inline-style-values` in the gate. A `// token-exempt: <reason>` comment is the one reviewed escape hatch.

### Light and dark are the same system

A component never branches on mode. It uses a semantic role (`bg-card`, `text-muted-foreground`) and the theme rebinds the role. If a component needs `dark:` anywhere, the role it needs is missing, which is a token proposal, not a variant.

**Enforced by:** `build.test.mjs` in the tokens package asserts dark is generated from the same source as light, and `contrast.test.mjs` asserts every surface and foreground pair meets AA in both. Nothing detects a stray `dark:` utility in a component: partially.

### Reserve elevation, and never nest it

Three levels exist and each means something: `shadow-card` for a distinct unit, `shadow-popover` for a floating surface, `shadow-dialog` for a blocking task. If every block is elevated, nothing stands out. A card inside a card reads as noise, not hierarchy.

**Enforced by:** partially. `no-raw-colors` rejects a shadow written with a raw colour, so a fourth level cannot be invented in place. Nothing detects blanket elevation or a nested surface: judgement.

### Colour never carries meaning alone

A status is picked by its semantic role (`success`, `warning`, `danger`, `info`) because of what it means, not because of the colour wanted. The label carries the meaning and the colour reinforces it, so the meaning survives a monochrome print, a colour-blind reader and a screen reader.

**Enforced by:** partially. `no-raw-colors` stops an invented colour. Nothing checks that a label accompanies a coloured badge: judgement.

## Structure

### The outline is real

`PageTitle` is the page's one `<h1>`, `SectionTitle` an `<h2>`, `CardTitle` an `<h3>`. A title is never faked with bold text, and a level is never skipped.

**Enforced by:** partially. `page.test.tsx`, `section.test.tsx` and `card.test.tsx` assert the primitives render those elements, and `a11y.test.tsx` runs axe over every story. A faked or skipped heading in an application screen is not detected: judgement, and the `COMPOSITION.md` checklist.

### One primary action per section

Two equal actions means one of them is `outline` or `ghost`. A screen with three primary buttons has no primary action.

**Enforced by:** not enforced. Judgement, and a review catch.

### Navigating is a link, acting is a button

A control that changes the URL is a link; a control that does something in place is a button. `Button asChild` renders a link with button styling without breaking either semantics.

**Enforced by:** partially. `no-raw-elements` rejects a raw `<button>` where `Button` exists. Nothing detects a `Button` doing a link's job: judgement.

### Every screen is built inside `Page`

The frame carries the viewport inset and cannot be zeroed. A screen assembled from raw containers outside `Page` can touch the edge, which is the boundary failure the first judged trial pair reproduced twice.

**Enforced by:** partially. `composition-contract.test.ts` keeps the rule bound to a real export, and `page.test.tsx` proves the frame cannot take a caller's class. Nothing detects a screen that omits `Page`: judgement, and the `COMPOSITION.md` checklist.

## Controls

### Every control has a programmatic label

An input, a switch, a checkbox or a select is named by a `<label>`, `aria-label` or `aria-labelledby`. Placeholder text is not a label.

**Enforced by:** `a11y.test.tsx` runs axe over every component story and fails on an unlabelled control. Application screens are not audited by it: partially.

### Disabled without a reason is a dead end

A disabled control says nothing about why. Pair it with a visible reason, or use a loading state, or do not render it.

**Enforced by:** not enforced. Judgement.

### Small sizes are not lone tap targets

A `size="sm"` button is 32px, below the 44px touch target minimum. It sits in a row of controls on a desktop surface, never as the only thing to tap on a phone.

**Enforced by:** not enforced. `a11y.test.tsx` cannot measure size in jsdom and says so. Judgement.

### Collapse reclaims space, never navigation

`AppShell`'s collapsed sidebar is a wide-screen convenience. Navigation must remain reachable in the collapsed state and on narrow screens.

**Enforced by:** not enforced. Judgement, and the keyboard scan the trial harness runs on a rendered screen.

## Documentation

### Every component is documented beside its source, and grouped once

A `COMPONENT.md` next to every component, a row in `CATALOG.md`, and a story whose group is the catalogue's group.

**Enforced by:** `docs-coverage.test.ts` and `story-group-is-catalogue-group.test.ts`.

### A rule that cannot name its basis is not a rule

A composition rule names the token or export it is expressed in. A convention names the gate that enforces it, or says it has none.

**Enforced by:** `composition-contract.test.ts` and `conventions-enforcement.test.ts`.
