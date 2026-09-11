import * as React from "react";
import { cn } from "../../lib/utils";

// Stack puts rhythm between things, and the rhythm can only come from the
// layout scale: `gap` is typed as the names of the layout tokens, so a number
// is a compile error and a raw pixel value has no way in.
export type StackGap = "page" | "section" | "group" | "control";

const GAP: Record<StackGap, string> = {
  page: "gap-page-gap",
  section: "gap-section-gap",
  group: "gap-group-gap",
  control: "gap-control-gap",
};

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

export interface StackProps extends React.ComponentProps<"div"> {
  /** The layout token that spaces the children. Never a number. */
  gap?: StackGap;
  direction?: "vertical" | "horizontal";
  align?: keyof typeof ALIGN;
  /** Let a horizontal stack wrap onto the next line rather than overflow. */
  wrap?: boolean;
}

export function Stack({
  className,
  gap = "group",
  direction = "vertical",
  align,
  wrap = false,
  ...props
}: StackProps) {
  return (
    <div
      data-slot="stack"
      data-direction={direction}
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        GAP[gap],
        align && ALIGN[align],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    />
  );
}
