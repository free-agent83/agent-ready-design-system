import * as React from "react";

// Fixed, loud styling for the contract element. It is never merged with a
// caller's className (see MissingProps and Missing below): the border, the
// colour and the visibility are the whole point, so nothing here is
// overridable. `border-gap-border bg-gap-subtle bg-gap-hatch text-gap` is
// deliberately magenta, not `danger`: a declared gap must never be mistaken
// for a status such as an error callout, so it is styled off the status
// palette entirely, in a colour that reads as nothing else in the system.
// `gap`/`gap-border`/`gap-subtle` exist only for this component; see
// COMPONENT.md and CONVENTIONS.md.
const missing =
  "flex min-h-9 items-center justify-center gap-1 rounded-md border-2 border-dashed border-gap-border bg-gap-subtle bg-gap-hatch px-3 font-mono text-xs font-medium tracking-wide text-gap";

export interface MissingProps
  extends Omit<React.ComponentProps<"div">, "style" | "role" | "aria-label" | "children"> {
  /**
   * What the system lacks: a component or a token. Where a product also
   * has `undrift` installed and runs its gate, this name is checked
   * against the catalog, and declaring a gap for something that already
   * exists is rejected.
   */
  what: string;
  /**
   * Why nothing in the system serves the need. Required, and never left
   * blank. Where a product runs `undrift gate`, a blank reason is
   * rejected; everywhere else an unexplained gap is indistinguishable
   * from laziness by inspection alone.
   */
  reason: string;
}

/**
 * Renders where the design system genuinely cannot serve a need. See
 * `AGENTS.md` rule 1a. Deliberately loud: functional enough to keep a
 * screen's layout honest, and visually unmistakable so a reviewer does
 * not miss it.
 *
 * Where a product also has `undrift` installed, its gate finds `<Missing>`
 * by the JSX tag name in source, not by the `data-undrift-*` attributes
 * below: those only mark the rendered gap in the DOM, for anyone
 * inspecting the running screen. This is the exported, token-styled
 * counterpart to the placeholder `undrift init` copies into a foreign
 * repo; both are found by the same tag name, so keep the two in step if
 * either contract changes.
 *
 * `className` and any other prop land on an outer wrapper, never on the
 * contract element itself (`style`, `role`, `aria-label` and `children`
 * are not accepted at all: passing them is a compile error). A caller
 * cannot dim, hide, recolour or relabel a declared gap by accident. See
 * COMPONENT.md.
 */
export function Missing({ what, reason, className, ...props }: MissingProps) {
  return (
    <div {...props} className={className}>
      <div
        data-slot="missing"
        data-undrift-missing={what}
        data-undrift-reason={reason}
        title={reason}
        role="note"
        aria-label={`Missing from design system: ${what}. ${reason}`}
        className={missing}
      >
        MISSING: {what}
      </div>
    </div>
  );
}
