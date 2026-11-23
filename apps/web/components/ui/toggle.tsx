"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "group/toggle hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      },
      variant: {
        default: "bg-transparent",
        outline: "border-input hover:bg-muted border bg-transparent",
      },
    },
  }
);

type ToggleProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange" | "aria-pressed" | "type" | "ref"
> &
  VariantProps<typeof toggleVariants> & {
    as?: React.ElementType;
    asChild?: boolean;
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    ref?: React.Ref<HTMLButtonElement>;
  };

function Toggle({
  as,
  asChild,
  children,
  className,
  defaultPressed = false,
  onClick,
  onPressedChange,
  pressed: pressedProp,
  ref,
  size = "default",
  variant = "default",
  ...props
}: ToggleProps) {
  const isControlled = pressedProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultPressed);
  const pressed = isControlled ? pressedProp : uncontrolled;
  const mergedClass = cn(toggleVariants({ className, size, variant }));

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as never);
    if (event.defaultPrevented) {
      return;
    }
    const next = !pressed;
    if (!isControlled) {
      setUncontrolled(next);
    }
    onPressedChange?.(next);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      "aria-pressed": pressed,
      className: cn(mergedClass, child.props.className as string),
      "data-slot": "toggle",
      "data-state": pressed ? "on" : "off",
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        (
          child.props.onClick as
            | ((e: React.MouseEvent<HTMLElement>) => void)
            | undefined
        )?.(event);
        handleClick(event);
      },
      ref,
    } as never);
  }

  const Component = (as ?? "button") as React.ElementType;
  return (
    <Component
      {...props}
      aria-pressed={pressed}
      className={mergedClass}
      data-slot="toggle"
      data-state={pressed ? "on" : "off"}
      onClick={handleClick}
      ref={ref}
      {...(as ? {} : { type: "button" as const })}
    >
      {children}
    </Component>
  );
}

export { Toggle, toggleVariants };
