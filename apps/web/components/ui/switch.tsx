"use client";

import * as React from "react";

import {
  getTransition,
  parseMotion,
  useMotionGuard,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type SwitchSize = "sm" | "default";

type SwitchProps = Omit<
  React.ComponentProps<"button">,
  "onChange" | "role" | "aria-checked" | "type"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  motion?: string;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
};

function Switch({
  checked: checkedProp,
  className,
  defaultChecked = false,
  disabled = false,
  motion,
  onClick,
  onCheckedChange,
  ref,
  size = "default",
  ...props
}: SwitchProps) {
  const isControlled = checkedProp !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked);
  const checked = isControlled ? checkedProp : uncontrolledChecked;
  const reduce = useReducedMotion();
  const internalRef = React.useRef<HTMLSpanElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [ref]
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    const next = !checked;
    if (!isControlled) {
      setUncontrolledChecked(next);
    }
    onCheckedChange?.(next);
  };

  const motionValue = motion;
  const thumbStyle: React.CSSProperties = {};
  if (reduce) {
    thumbStyle.transition = "none";
  } else if (motionValue !== undefined) {
    const transition = getTransition(parseMotion(motionValue));
    if (transition) {
      thumbStyle.transition = transition;
    }
  }

  const motionEnabled = motionValue !== undefined && !reduce;
  const styleFingerprint = JSON.stringify(thumbStyle);
  const yielded = useMotionGuard(internalRef, motionEnabled, styleFingerprint);
  if (yielded && !reduce) {
    thumbStyle.transition = "none";
  }

  return (
    <button
      aria-checked={checked}
      className={cn(
        "peer group/switch focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        className
      )}
      data-size={size}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={handleClick}
      ref={setRef}
      role="switch"
      type="button"
      {...props}
    >
      <span
        className={cn(
          "bg-background dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground pointer-events-none block rounded-full ring-0",
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "transition-transform group-data-[size=default]/switch:data-[state=checked]:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-[state=unchecked]:translate-x-0",
          "group-data-[size=sm]/switch:data-[state=checked]:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-0"
        )}
        data-slot="switch-thumb"
        data-state={checked ? "checked" : "unchecked"}
        ref={internalRef}
        style={thumbStyle}
      />
    </button>
  );
}

export { Switch };
