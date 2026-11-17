"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type CheckedState = boolean | "indeterminate";

type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange" | "role" | "aria-checked" | "type"
> & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  disabled?: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
  ref?: React.Ref<HTMLButtonElement>;
};

function Checkbox({
  checked: checkedProp,
  className,
  defaultChecked = false,
  disabled = false,
  onClick,
  onCheckedChange,
  ref,
  ...props
}: CheckboxProps) {
  const isControlled = checkedProp !== undefined;
  const [uncontrolled, setUncontrolled] =
    React.useState<CheckedState>(defaultChecked);
  const checked = isControlled ? checkedProp : uncontrolled;
  const isChecked = checked === true;
  const isIndeterminate = checked === "indeterminate";
  const isActive = isChecked || isIndeterminate;
  const dataState = isIndeterminate
    ? "indeterminate"
    : isChecked
      ? "checked"
      : "unchecked";
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    const next: CheckedState = !isChecked;
    if (!isControlled) {
      setUncontrolled(next);
    }
    onCheckedChange?.(next);
  };
  return (
    <button
      aria-checked={isIndeterminate ? "mixed" : isChecked}
      className={cn(
        "peer border-input group-has-[:focus-visible]/field-label:not-data-checked:border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
        className
      )}
      data-checked={isActive ? "" : undefined}
      data-slot="checkbox"
      data-state={dataState}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      role="checkbox"
      type="button"
      {...props}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="grid place-content-center text-current [&>svg]:size-3.5"
          data-slot="checkbox-indicator"
        >
          {isIndeterminate ? (
            <span className="block h-px w-2 rounded-full bg-current" />
          ) : (
            <CheckIcon />
          )}
        </span>
      ) : null}
    </button>
  );
}

export { Checkbox };
