"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  disabled: boolean;
  name: string;
  registerItem: (value: string) => () => void;
  setValue: (value: string) => void;
  value: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null
);

function useRadioGroupContext(): RadioGroupContextValue {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error("RadioGroupItem must be used within <RadioGroup>.");
  }
  return ctx;
}

type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
};

function RadioGroup({
  className,
  defaultValue = "",
  disabled = false,
  name: nameProp,
  onKeyDown,
  onValueChange,
  orientation = "vertical",
  required = false,
  value: valueProp,
  ...props
}: RadioGroupProps) {
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const groupName = React.useId().replace(/:/gu, "");
  const name = nameProp ?? groupName;
  const itemsRef = React.useRef<string[]>([]);

  const registerItem = React.useCallback((next: string) => {
    if (!itemsRef.current.includes(next)) {
      itemsRef.current = [...itemsRef.current, next];
    }
    return () => {
      itemsRef.current = itemsRef.current.filter((x) => x !== next);
    };
  }, []);

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const ctx = React.useMemo<RadioGroupContextValue>(
    () => ({ disabled, name, registerItem, setValue, value }),
    [disabled, name, registerItem, setValue, value]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const root = event.currentTarget;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(
        "[data-slot=radio-group-item]:not([disabled])"
      )
    );
    if (items.length === 0) {
      return;
    }
    const currentIdx = items.indexOf(document.activeElement as HTMLElement);
    if (currentIdx < 0) {
      return;
    }
    const isVertical = orientation === "vertical";
    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    let nextIdx = -1;
    if (event.key === nextKey) {
      nextIdx = (currentIdx + 1) % items.length;
    } else if (event.key === prevKey) {
      nextIdx = (currentIdx - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIdx = 0;
    } else if (event.key === "End") {
      nextIdx = items.length - 1;
    }
    if (nextIdx < 0) {
      return;
    }
    event.preventDefault();
    items[nextIdx].focus();
    const nextValue = items[nextIdx].getAttribute("data-value");
    if (nextValue) {
      setValue(nextValue);
    }
  };

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        {...props}
        aria-disabled={disabled || undefined}
        aria-orientation={orientation}
        aria-required={required || undefined}
        className={cn("grid w-full gap-2", className)}
        data-disabled={disabled || undefined}
        data-orientation={orientation}
        data-slot="radio-group"
        data-value={value}
        onKeyDown={handleKeyDown}
        role="radiogroup"
      >
        {props.children}
        <input name={name} type="hidden" value={value} />
      </div>
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange" | "role" | "aria-checked" | "type" | "ref" | "value"
> & {
  value: string;
  ref?: React.Ref<HTMLButtonElement>;
};

function RadioGroupItem({
  className,
  disabled: disabledProp,
  onClick,
  ref,
  value,
  ...props
}: RadioGroupItemProps) {
  const ctx = useRadioGroupContext();
  const isChecked = ctx.value === value;
  const isDisabled = ctx.disabled || disabledProp === true;
  const registerItem = ctx.registerItem;

  React.useEffect(() => registerItem(value), [registerItem, value]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) {
      return;
    }
    ctx.setValue(value);
  };

  return (
    <button
      {...props}
      aria-checked={isChecked}
      className={cn(
        "group/radio-group-item peer border-input group-has-[:focus-visible]/field-label:not-data-checked:border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary relative flex aspect-square size-4 shrink-0 rounded-full border outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
        className
      )}
      data-checked={isChecked ? "" : undefined}
      data-slot="radio-group-item"
      data-state={isChecked ? "checked" : "unchecked"}
      data-value={value}
      disabled={isDisabled}
      onClick={handleClick}
      ref={ref}
      role="radio"
      tabIndex={isChecked ? 0 : -1}
      type="button"
    >
      {isChecked ? (
        <span
          aria-hidden="true"
          className="flex size-4 items-center justify-center"
          data-slot="radio-group-indicator"
        >
          <span className="bg-primary-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </span>
      ) : null}
    </button>
  );
}

export { RadioGroup, RadioGroupItem };
