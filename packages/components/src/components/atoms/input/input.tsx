import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const input = cva(
  "flex w-full rounded-md border border-input bg-background text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-3", lg: "h-12 px-4 text-lg" },
    },
    defaultVariants: { size: "md" },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof input> {}

export function Input({ className, size, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      data-size={size ?? "md"}
      className={cn(input({ size }), className)}
      {...props}
    />
  );
}
