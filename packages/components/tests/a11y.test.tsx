// The accessibility gate.
//
// Sits alongside the other cross-component gates (no-hardcoded-values,
// docs-coverage): a property every component must hold, checked once for all of
// them rather than remembered per component.
//
// It runs axe against EVERY story of every component rather than against
// hand-written renders. The stories already cover each variant and size, they
// are the living documentation, and they are maintained because Storybook uses
// them. A hand-written render list would be a second, quietly rotting copy of
// the same thing, and a new variant would be gated only if someone remembered
// to add it here.
//
// WHAT THIS CANNOT SEE, stated plainly because an accessibility check that
// overstates its reach is worse than none:
//
//   - Colour contrast. axe measures contrast from computed layout, and jsdom
//     has no layout engine, so the rule is disabled below rather than silently
//     passing. Contrast is covered in a real browser by @storybook/addon-a11y
//     and by the ThemeProof story's computed-style assertions.
//   - Anything behind an interaction. A Dialog, Popover, DropdownMenu or
//     Tooltip renders only its trigger until opened; stories are rendered, not
//     played, so only the trigger is audited here.
//   - Focus order and screen-reader output, which need a real AT.
//
// What it does catch is the class that actually ships: missing accessible
// names, bad roles and ARIA, unlabelled controls, duplicate ids, and broken
// name-role-value pairings.
import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import axe from "axe-core";

// Vite resolves this at build time, so a new component's stories are picked up
// by existing, without touching this file.
const storyModules = import.meta.glob("../src/components/**/*.stories.tsx", { eager: true });

// jsdom reports every element as zero-sized, so axe cannot judge contrast or
// whether a target is large enough to hit. Disabled explicitly: a rule that
// cannot run should be declared, never left to pass by accident.
const RULES_NEEDING_LAYOUT = ["color-contrast", "target-size"];

const AXE_OPTIONS: axe.RunOptions = {
  rules: Object.fromEntries(RULES_NEEDING_LAYOUT.map((id) => [id, { enabled: false }])),
  resultTypes: ["violations"],
};

/** axe reports a violation as a rule plus the nodes that broke it. Flatten it
 *  to something a failing test prints usefully: the rule, why it matters, and
 *  the offending markup. */
const describeViolations = (violations: axe.Result[]) =>
  violations
    .map((v) => `  ${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `    ${n.html}`).join("\n")}`)
    .join("\n");

const entries = Object.entries(storyModules);

test("every component has stories to audit", () => {
  // Guards the glob itself. If the path or the naming convention changes, this
  // file would otherwise iterate an empty list and report a clean pass over
  // nothing at all.
  expect(entries.length).toBeGreaterThan(0);
});

describe.each(entries)("%s", (_path, mod) => {
  const stories = composeStories(mod as Parameters<typeof composeStories>[0]);

  test.each(Object.keys(stories))("%s has no accessibility violations", async (name) => {
    const Story = stories[name as keyof typeof stories] as React.ComponentType;
    const { container } = render(<Story />);

    const { violations } = await axe.run(container, AXE_OPTIONS);

    expect(violations, `\n${describeViolations(violations)}\n`).toEqual([]);
  });
});
