"use client";

import type { VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { buttonVariants, cn } from "@/lib/utils";

export interface SiteButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function SiteButton({
  className,
  variant,
  size,
  asChild,
  ...props
}: SiteButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-inline
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  );
}
