---
story: Layout/Page/Page with sections
---

# The compositional contract

`CATALOG.md` says which component to reach for. This file says how components sit together on a screen, and it says it in numbers and exports rather than in taste. Every rule below names the token or the exported primitive it is expressed in, and how it fails. Where the system is silent, the decision is taste and this document has no opinion.

Read this after `CATALOG.md` and before building any screen. The rules are checked two ways: a test (`tests/composition-contract.test.ts`) asserts every "Expressed as" entry resolves to a real token or export, so a rule that cannot name its basis cannot be added; and a person answers a binary checklist against the rendered `Page with sections` story, because conformance on a screen is something a human sees and any automation of that judgement earns its place only by agreeing with the human first.

## Why this file exists

The first judged trial pair went the same way twice: the informed agent used the system's layout primitives correctly and the screen was worse than the cold agent's hand-rolled one, because the primitive's default let content touch the viewport edge. Documentation told the agent what to use. It did not encode what correct looks like. So the layer above the component is built from defaults that cannot be wrong first, named in tokens second, and explained in prose last.

## Rules

| Rule | Expressed as | Fails when |
|---|---|---|
| Page content is inset from the viewport | `Page`, `layout.page.inset` | content touches a viewport edge at any breakpoint |
| The page's content column has a ceiling | `Page`, `layout.page.max` | a line of body text runs the full width of a wide screen |
| Top-level sections are separated | `Page`, `layout.page.gap` | sections run together with no measurable gap |
| Related content is grouped in a container | `Section` | a settings group sits in undifferentiated page flow |
| A group that is a unit sits on its own surface, with its inset | `Section`, `layout.section.inset` | a group's background matches the page ground, or a surface has no padding |
| Groups within a section are separated | `Section`, `layout.section.gap` | two groups touch |
| Spacing comes from the scale | `Stack`, `layout.group.gap` | a raw pixel value appears in layout markup |
| A control sits with its label | `Stack`, `layout.control.gap` | a label floats away from its control, or touches it |
| Columns collapse | `Grid`, `layout.grid.min.sm` | a grid overflows or squashes below its minimum on a narrow screen |
| The frame is the system's frame | `AppShell` | a page frame is re-derived from raw elements |
| The outline is correct | `PageTitle`, `SectionTitle`, `CardTitle` | a heading level is skipped or a title is faked with bold text |

## What the rules do not say

Which content goes in which section. How many sections a screen has. Whether a group is a unit. Those are design decisions for the screen, and `AGENTS.md` rule 2 applies: propose, do not improvise. The contract only guarantees that whatever is decided is spaced, inset, surfaced and collapsed by the scale rather than by a number someone typed.

## The checklist a person answers

Against the rendered `Page with sections` story, each a yes or no:

1. Does any content touch a viewport edge at 390px, 768px or 1280px?
2. Is there a visible gap between every pair of top-level sections?
3. Does every group that is a unit sit on a surface distinct from the page ground?
4. Does every label sit closer to its own control than to anything else?
5. Do the grid's cards stack in one column at 390px and sit side by side at 1280px?
6. Is the heading order h1, then h2, then h3, with nothing skipped?

Six no's is conformance. Any yes is a finding, and a finding attributes to one of three causes: the rule was not followed, the primitive that encodes it is missing, or the primitive's default is wrong. The third is the one this file exists to make rare.
