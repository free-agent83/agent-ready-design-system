import * as React from "react";
import { cn } from "../../../lib/utils";

// Compositional, variant-less HTML table styled with plain class constants + `cn`.
// `numeric` on a head/cell is a boolean toggle (not a closed union), so it's a
// plain conditional rather than a cva axis: it right-aligns and applies tabular
// figures so columns of numbers line up.
const table = "w-full caption-bottom text-sm";
const header = "[&_tr]:border-b [&_tr]:border-border";
const body = "[&_tr:last-child]:border-0";
const footer = "border-t border-border bg-muted/50 font-medium";
const row =
  "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted";
const head = "h-10 px-2 text-left align-middle font-medium text-muted-foreground";
const cell = "p-2 align-middle";
const caption = "mt-4 text-sm text-muted-foreground";
const numericCell = "text-right tabular-nums";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn(table, className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn(header, className)} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn(body, className)} {...props} />;
}

export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn(footer, className)} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn(row, className)} {...props} />;
}

export interface TableHeadProps extends React.ComponentProps<"th"> {
  // Right-align + tabular figures for a numeric column header.
  numeric?: boolean;
}

export function TableHead({ className, numeric, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(head, numeric && numericCell, className)}
      {...props}
    />
  );
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  // Right-align + tabular figures so numbers line up down the column.
  numeric?: boolean;
}

export function TableCell({ className, numeric, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(cell, numeric && numericCell, className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn(caption, className)} {...props} />;
}
