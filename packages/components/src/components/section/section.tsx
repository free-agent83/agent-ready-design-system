import * as React from "react";
import { cn } from "../../lib/utils";

// Section is a top-level group within a Page. Two guarantees: the groups
// inside it are separated by layout.section.gap, and when it sits on its own
// surface it carries the card surface, border, elevation and section inset
// together, so a group can never be "on a surface" with no padding.
const section = "flex flex-col gap-section-gap";
const onSurface = "rounded-lg border border-border bg-card p-section-inset text-card-foreground shadow-card";

export interface SectionProps extends React.ComponentProps<"section"> {
  /** Sit the section on its own surface (the card surface, with the section inset). */
  surface?: boolean;
}

export function Section({ className, surface = false, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      data-surface={surface ? "true" : undefined}
      className={cn(section, surface && onSurface, className)}
      {...props}
    />
  );
}

export function SectionHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="section-header" className={cn("flex flex-col gap-control-gap", className)} {...props} />;
}

// A section's title is an <h2>: under the page's h1, above any card's h3.
export function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="section-title" className={cn("text-lg font-semibold leading-tight tracking-tight", className)} {...props} />;
}

export function SectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="section-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
