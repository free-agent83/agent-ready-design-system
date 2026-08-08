"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const switchTrack = cva(
  "inline-flex shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed bg-input data-[state=checked]:bg-primary",
  {
    variants: { size: { sm: "h-5 w-9", md: "h-6 w-11" } },
    defaultVariants: { size: "md" },
  }
);

const switchThumb = cva(
  "pointer-events-none block rounded-full bg-background border border-border transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4",
        md: "h-5 w-5 data-[state=checked]:translate-x-5",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchTrack> {}

export function Switch({ className, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? "md"}
      className={cn(switchTrack({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(switchThumb({ size }))} />
    </SwitchPrimitive.Root>
  );
}
