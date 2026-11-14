import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 text-xs leading-none font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] data-[icon-only]:aspect-square data-[icon-only]:px-0 [&_[data-slot=spinner]]:size-2.5 [&_[data-slot=spinner][data-variant=default]]:border [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive:
          "bg-destructive focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90 text-white",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
      },
    },
  }
);

type BadgeProps = Omit<React.ComponentProps<"span">, "ref"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    as?: React.ElementType;
    iconOnly?: boolean;
    ref?: React.Ref<HTMLSpanElement>;
  } & Record<string, unknown>;

function Badge({
  className,
  variant = "default",
  asChild = false,
  as,
  iconOnly = false,
  ...props
}: BadgeProps) {
  const Comp = as ?? (asChild ? Slot : "span");

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-icon-only={iconOnly ? "" : undefined}
      data-inline
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
