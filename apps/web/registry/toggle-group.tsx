"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface ToggleGroupContextValue {
  disabled?: boolean;
  orientation: "horizontal" | "vertical";
  registerItem: (value: string) => () => void;
  setValue: (next: string) => void;
  size?: VariantProps<typeof toggleVariants>["size"];
  spacing: number;
  type: "single" | "multiple";
  value: string[];
  variant?: VariantProps<typeof toggleVariants>["variant"];
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
);

function useToggleGroupContext(): ToggleGroupContextValue {
  const ctx = React.useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error("ToggleGroupItem must be used within <ToggleGroup>.");
  }
  return ctx;
}

type ToggleGroupBaseProps = VariantProps<typeof toggleVariants> & {
  className?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: number;
  disabled?: boolean;
  children?: React.ReactNode;
};

type SingleProps = ToggleGroupBaseProps & {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type MultipleProps = ToggleGroupBaseProps & {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type ToggleGroupProps = SingleProps | MultipleProps;

function ToggleGroup(props: ToggleGroupProps) {
  const {
    children,
    className,
    disabled,
    orientation = "horizontal",
    size,
    spacing = 2,
    variant,
  } = props;
  const isMultiple = props.type === "multiple";
  const isControlled = props.value !== undefined;
  const defaultValue = props.defaultValue;
  const [uncontrolledSingle, setUncontrolledSingle] = React.useState<string>(
    isMultiple ? "" : ((defaultValue as string | undefined) ?? "")
  );
  const [uncontrolledMultiple, setUncontrolledMultiple] = React.useState<
    string[]
  >(isMultiple ? ((defaultValue as string[] | undefined) ?? []) : []);
  const value: string[] = isMultiple
    ? isControlled
      ? ((props.value as string[] | undefined) ?? [])
      : uncontrolledMultiple
    : isControlled
      ? props.value
        ? [props.value as string]
        : []
      : uncontrolledSingle
        ? [uncontrolledSingle]
        : [];

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
      if (isMultiple) {
        const current = isControlled
          ? ((props.value as string[] | undefined) ?? [])
          : uncontrolledMultiple;
        const newValue = current.includes(next)
          ? current.filter((v) => v !== next)
          : [...current, next];
        if (!isControlled) {
          setUncontrolledMultiple(newValue);
        }
        (props.onValueChange as ((v: string[]) => void) | undefined)?.(
          newValue
        );
      } else {
        const current = isControlled ? props.value : uncontrolledSingle;
        const newValue = current === next ? "" : next;
        if (!isControlled) {
          setUncontrolledSingle(newValue);
        }
        (props.onValueChange as ((v: string) => void) | undefined)?.(newValue);
      }
    },
    [
      isControlled,
      isMultiple,
      props.onValueChange,
      props.value,
      uncontrolledMultiple,
      uncontrolledSingle,
    ]
  );

  const ctx = React.useMemo<ToggleGroupContextValue>(
    () => ({
      disabled,
      orientation,
      registerItem,
      setValue,
      size,
      spacing,
      type: isMultiple ? "multiple" : "single",
      value,
      variant,
    }),
    [
      disabled,
      isMultiple,
      orientation,
      registerItem,
      setValue,
      size,
      spacing,
      value,
      variant,
    ]
  );

  return (
    <ToggleGroupContext.Provider value={ctx}>
      <div
        aria-disabled={disabled || undefined}
        className={cn(
          "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-vertical:flex-col data-vertical:items-stretch data-[size=sm]:rounded-[min(var(--radius-md),10px)]",
          className
        )}
        data-disabled={disabled || undefined}
        data-orientation={orientation}
        data-size={size}
        data-slot="toggle-group"
        data-spacing={spacing}
        data-variant={variant}
        role="group"
        style={{ "--gap": spacing } as React.CSSProperties}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

type ToggleGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value" | "ref" | "aria-pressed" | "type"
> &
  VariantProps<typeof toggleVariants> & {
    value: string;
    ref?: React.Ref<HTMLButtonElement>;
  };

function ToggleGroupItem({
  className,
  disabled: disabledProp,
  onClick,
  ref,
  size,
  value,
  variant,
  ...props
}: ToggleGroupItemProps) {
  const ctx = useToggleGroupContext();
  const isPressed = ctx.value.includes(value);
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
      aria-pressed={isPressed}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          size: ctx.size || size,
          variant: ctx.variant || variant,
        }),
        className
      )}
      data-size={ctx.size || size}
      data-slot="toggle-group-item"
      data-spacing={ctx.spacing}
      data-state={isPressed ? "on" : "off"}
      data-value={value}
      data-variant={ctx.variant || variant}
      disabled={isDisabled}
      onClick={handleClick}
      ref={ref}
      type="button"
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
