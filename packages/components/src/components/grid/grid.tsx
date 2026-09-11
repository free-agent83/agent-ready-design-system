import * as React from "react";
import { cn } from "../../lib/utils";
import type { StackGap } from "../stack/stack";

// Grid lays children out in columns that collapse. `min` names the narrowest
// a column may become, from the layout scale, and the columns are
// `repeat(auto-fit, minmax(min, 1fr))`: there is no non-responsive mode and
// no column count to get wrong on a phone.
export type GridMin = "xs" | "sm" | "md" | "lg";

const MIN: Record<GridMin, string> = {
  xs: "grid-auto-xs",
  sm: "grid-auto-sm",
  md: "grid-auto-md",
  lg: "grid-auto-lg",
};

const GAP: Record<StackGap, string> = {
  page: "gap-page-gap",
  section: "gap-section-gap",
  group: "gap-group-gap",
  control: "gap-control-gap",
};

export interface GridProps extends React.ComponentProps<"div"> {
  /** The narrowest a column may become before the grid collapses. A layout token, never a number. */
  min?: GridMin;
  /** The layout token between cells. */
  gap?: StackGap;
}

export function Grid({ className, min = "sm", gap = "group", ...props }: GridProps) {
  return <div data-slot="grid" data-min={min} className={cn("grid", MIN[min], GAP[gap], className)} {...props} />;
}
