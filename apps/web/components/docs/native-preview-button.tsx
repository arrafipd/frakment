"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const nativePreviewButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:bg-muted disabled:text-muted-foreground inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: { size: "default", variant: "default" },
    variants: {
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-sm": "size-8",
        "icon-xs": "size-7",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        xs: "h-7 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground active:bg-primary/90 shadow-xs",
        destructive:
          "bg-destructive active:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 text-white shadow-xs",
        ghost:
          "active:bg-accent active:text-accent-foreground dark:active:bg-accent/50",
        link: "text-primary underline-offset-4 active:underline",
        outline:
          "active:bg-accent active:text-accent-foreground dark:border-input dark:active:bg-input/50 border shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground active:bg-secondary/80 shadow-xs",
      },
    },
  }
);

export interface NativePreviewButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof nativePreviewButtonVariants> {}

export function NativePreviewButton({
  className,
  variant,
  size,
  ...props
}: NativePreviewButtonProps) {
  return (
    <button
      className={cn(nativePreviewButtonVariants({ className, size, variant }))}
      type="button"
      {...props}
    />
  );
}

export { nativePreviewButtonVariants };
