"use client";

import * as React from "react";

import { getTransition, parseMotion, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const defaultCollapsibleMotion = "450 cubic-bezier(0.32, 0.72, 0, 1)";

interface CollapsibleContextValue {
  contentId: string;
  disabled: boolean;
  motion: string | undefined;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  triggerId: string;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null
);

function useCollapsibleContext(component: string): CollapsibleContextValue {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Collapsible`);
  }
  return ctx;
}

interface CollapsibleProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  defaultOpen?: boolean;
  disabled?: boolean;
  motion?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function Collapsible({
  children,
  className,
  defaultOpen,
  disabled = false,
  motion,
  onOpenChange,
  open: openProp,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  );
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const triggerId = React.useId();
  const contentId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const context = React.useMemo<CollapsibleContextValue>(
    () => ({
      contentId,
      disabled,
      motion,
      onOpenChange: setOpen,
      open,
      triggerId,
    }),
    [contentId, disabled, motion, setOpen, open, triggerId]
  );

  return (
    <CollapsibleContext.Provider value={context}>
      <div
        className={className}
        data-disabled={disabled ? "" : undefined}
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

type CollapsibleTriggerProps = Omit<React.ComponentProps<"button">, "ref"> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLButtonElement>;
} & Record<string, unknown>;

function CollapsibleTrigger({
  as,
  children,
  className,
  onClick,
  ref,
  ...props
}: CollapsibleTriggerProps) {
  const { contentId, disabled, onOpenChange, open, triggerId } =
    useCollapsibleContext("CollapsibleTrigger");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    onOpenChange(!open);
  };

  const finalProps: Record<string, unknown> = {
    ...props,
    "aria-controls": contentId,
    "aria-expanded": open,
    className: cn(className),
    "data-disabled": disabled ? "" : undefined,
    "data-slot": "collapsible-trigger",
    "data-state": open ? "open" : "closed",
    id: triggerId,
    onClick: handleClick,
    ref,
  };
  if (!(as || "type" in props)) {
    finalProps.type = "button";
    finalProps.disabled = disabled;
  }
  const Comp = as ?? "button";
  return <Comp {...finalProps}>{children}</Comp>;
}

interface CollapsibleContentProps extends React.ComponentProps<"div"> {
  motion?: string | false;
}

function CollapsibleContent({
  children,
  className,
  motion: localMotion,
  style,
  ...props
}: CollapsibleContentProps) {
  const {
    contentId,
    disabled,
    motion: contextMotion,
    open,
    triggerId,
  } = useCollapsibleContext("CollapsibleContent");
  const reduce = useReducedMotion();
  const motionProp =
    localMotion === false ? "off" : (localMotion ?? contextMotion);
  const motionValue = motionProp ?? defaultCollapsibleMotion;

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: open ? "1fr" : "0fr",
    opacity: open ? 1 : 0,
    ...style,
  };

  if (reduce) {
    gridStyle.transition = "none";
  } else {
    const transition = getTransition(parseMotion(motionValue));
    if (transition) {
      gridStyle.transition = transition;
    }
  }

  return (
    <div
      aria-labelledby={triggerId}
      data-disabled={disabled ? "" : undefined}
      data-slot="collapsible-content"
      data-state={open ? "open" : "closed"}
      id={contentId}
      role="region"
      {...props}
    >
      <div inert={!open} style={gridStyle}>
        <div style={{ minHeight: 0, overflow: "hidden" }}>
          <div className={cn(className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
