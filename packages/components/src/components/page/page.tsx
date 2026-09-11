import * as React from "react";
import { cn } from "../../lib/utils";

// Page is the frame every screen sits in. Its one guarantee is that content
// is inset from every viewport edge, and the guarantee is structural: the
// inset lives on an outer element that takes no className and has no prop to
// change it. The only way to render flush is to not use Page. (The first
// judged trial pair failed exactly here: the agent used the system's layout
// primitives correctly and the primitive's default let content touch the
// bottom of the viewport. A default that can be zero is not a default.)
const frame = "p-page-inset";
const column = "mx-auto flex w-full max-w-page-max flex-col gap-page-gap";

export type PageProps = Omit<React.ComponentProps<"div">, "style">;

export function Page({ className, children, ...props }: PageProps) {
  return (
    <div data-slot="page" className={frame}>
      <div data-slot="page-column" className={cn(column, className)} {...props}>
        {children}
      </div>
    </div>
  );
}

// The page's own heading row: title, an optional description, and a place for
// the page-level actions. Renders an <h1> so the outline starts where the
// page does.
export function PageHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-wrap items-start justify-between gap-group-gap", className)}
      {...props}
    />
  );
}

export function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 data-slot="page-title" className={cn("text-2xl font-semibold tracking-tight", className)} {...props} />;
}

export function PageDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="page-description" className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />;
}

export function PageActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="page-actions" className={cn("flex items-center gap-control-gap", className)} {...props} />;
}
