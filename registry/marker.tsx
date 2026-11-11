import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const markerVariants = cva(
  "group/marker text-muted-foreground [a]:hover:text-foreground relative flex min-h-4 w-full items-center gap-2 text-left text-sm [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3",
  {
    variants: {
      variant: {
        border: "border-border border-b pb-2",
        default: "",
        separator:
          "before:bg-border after:bg-border before:mr-1 before:h-px before:min-w-0 before:flex-1 after:ml-1 after:h-px after:min-w-0 after:flex-1",
      },
    },
  }
);

function Marker({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof markerVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      className={cn(markerVariants({ className, variant }))}
      data-slot="marker"
      data-variant={variant}
      {...props}
    />
  );
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="marker-icon"
      {...props}
    />
  );
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "*:[a]:hover:text-foreground min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      data-slot="marker-content"
      {...props}
    />
  );
}

export { Marker, MarkerContent, MarkerIcon, markerVariants };
