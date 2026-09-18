import { readFileSync } from "node:fs";
import fg from "fast-glob";
import { expect, test } from "vitest";

// The `gap` semantic role is magenta and deliberately off the rest of the
// palette, reserved for Missing's declared-gap marker (see its COMPONENT.md
// and CONVENTIONS.md, "Colour never carries meaning alone"). A gap must
// never be mistaken for a real part of the system, which only holds if no
// other component borrows the colour for its own styling. This scans every
// component source file except missing.tsx for any utility built on the
// `gap`/`gap-subtle`/`gap-foreground`/`gap-hatch`/`gap-border` colour role
// (including a variant prefix such as `dark:` or `hover:`, and a raw
// `--color-gap`/`--color-semantic-gap` reference, e.g. an arbitrary value
// like `bg-[var(--color-gap)]`) and fails the build if one is found.
//
// The Tailwind sizing utility `gap-*` (flex/grid gap, e.g. `gap-1`,
// `gap-x-2`, `gap-section-gap`) is a different thing entirely and must not
// trip this: the pattern only matches a colour-utility prefix (`bg-`,
// `text-`, `border-`, `ring-`, `fill-`, `stroke-`, `from-`/`via-`/`to-`,
// `divide-`, `decoration-`, `shadow-`, `accent-`, `caret-`,
// `placeholder-`, `outline-`, and the directional `border-x`/`border-t`
// etc. forms) immediately before `-gap`, never a bare `gap-` on its own.
const GAP_UTILITY =
  /(?<![\w-])(?:[a-z0-9-]+:)*(?:bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|inset-ring|outline|fill|stroke|from|via|to|divide|decoration|shadow|inset-shadow|drop-shadow|accent|caret|placeholder)-gap(?:-subtle|-foreground|-hatch|-border)?(?![\w-])|--color-(?:semantic-)?gap\b/;

const files = fg.sync("src/components/**/!(*.stories|*.test|*.test-d).tsx", {
  cwd: process.cwd(),
  absolute: true,
});

test("no component other than Missing uses a `gap` colour utility", () => {
  const offenders: string[] = [];
  for (const f of files) {
    if (f.endsWith("/missing/missing.tsx")) continue;
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (GAP_UTILITY.test(line)) offenders.push(`${f}:${i + 1}  ${line.trim()}`);
      });
  }
  expect(offenders, `\n${offenders.join("\n")}`).toEqual([]);
});
