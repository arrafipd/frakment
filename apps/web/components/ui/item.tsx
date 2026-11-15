import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        muted: "bg-muted text-foreground border-transparent",
        outline: "border-border bg-transparent",
      },
    },
  }
);

type ItemProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof itemVariants> & {
    as?: React.ElementType;
    asChild?: boolean;
  };

function Item({
  as,
  asChild,
  children,
  className,
  variant,
  ...props
}: ItemProps) {
  const mergedClass = cn(itemVariants({ variant }), className);
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      ...props,
      className: cn(mergedClass, child.props.className),
      "data-slot": "item",
      "data-variant": variant,
    } as never);
  }
  const Comp = (as ?? "div") as React.ElementType;
  return (
    <Comp
      className={mergedClass}
      data-slot="item"
      data-variant={variant}
      {...props}
    >
      {children}
    </Comp>
  );
}

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-slot="item-group"
      {...props}
    />
  );
}

function ItemMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="item-media"
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      data-slot="item-content"
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("truncate text-sm leading-tight font-medium", className)}
      data-slot="item-title"
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="item-description"
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-2", className)}
      data-slot="item-actions"
      {...props}
    />
  );
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
};
