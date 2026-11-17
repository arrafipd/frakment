"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsContextValue {
  baseId: string;
  orientation: "horizontal" | "vertical";
  setValue: (value: string) => void;
  value: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used within <Tabs>.");
  }
  return ctx;
}

interface TabsProps {
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  value?: string;
}

function Tabs({
  children,
  className,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
}: TabsProps) {
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const baseId = React.useId();
  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );
  const ctx = React.useMemo<TabsContextValue>(
    () => ({ baseId, orientation, setValue, value }),
    [value, setValue, baseId, orientation]
  );
  return (
    <TabsContext.Provider value={ctx}>
      <div
        className={cn(
          "flex flex-col gap-2",
          orientation === "vertical" && "flex-row",
          className
        )}
        data-orientation={orientation}
        data-slot="tabs"
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabsListProps = React.ComponentPropsWithoutRef<"div">;

function TabsList({ children, className, onKeyDown, ...props }: TabsListProps) {
  const ctx = useTabsContext();
  const listRef = React.useRef<HTMLDivElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) {
      return;
    }
    const root = listRef.current;
    if (!root) {
      return;
    }
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "[data-slot=tabs-trigger]:not([disabled])"
      )
    );
    if (triggers.length === 0) {
      return;
    }
    const currentIdx = triggers.indexOf(
      document.activeElement as HTMLButtonElement
    );
    if (currentIdx < 0) {
      return;
    }
    let nextIdx = -1;
    const isVertical = ctx.orientation === "vertical";
    const prev = isVertical ? "ArrowUp" : "ArrowLeft";
    const next = isVertical ? "ArrowDown" : "ArrowRight";
    if (e.key === next) {
      nextIdx = (currentIdx + 1) % triggers.length;
    } else if (e.key === prev) {
      nextIdx = (currentIdx - 1 + triggers.length) % triggers.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = triggers.length - 1;
    }
    if (nextIdx < 0) {
      return;
    }
    e.preventDefault();
    triggers[nextIdx].focus();
    triggers[nextIdx].click();
  };
  return (
    <div
      {...props}
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] outline-none",
        className
      )}
      data-slot="tabs-list"
      onKeyDown={handleKeyDown}
      ref={listRef}
      role="tablist"
    >
      {children}
    </div>
  );
}

type TabsTriggerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value" | "ref"
> & {
  value: string;
  ref?: React.Ref<HTMLButtonElement>;
};

function TabsTrigger({
  children,
  className,
  onClick,
  ref,
  value,
  ...props
}: TabsTriggerProps) {
  const ctx = useTabsContext();
  const isActive = ctx.value === value;
  const triggerId = `${ctx.baseId}-trigger-${value}`;
  const contentId = `${ctx.baseId}-content-${value}`;
  return (
    <button
      {...props}
      aria-controls={contentId}
      aria-selected={isActive}
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow,opacity] duration-150 focus-visible:outline-none active:opacity-60 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4",
        className
      )}
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      id={triggerId}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) {
          return;
        }
        ctx.setValue(value);
      }}
      ref={ref}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      {children}
    </button>
  );
}

type TabsContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "value"> & {
  value: string;
  as?: React.ElementType;
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

function TabsContent({
  as,
  asChild,
  children,
  className,
  ref,
  value,
  ...props
}: TabsContentProps) {
  const ctx = useTabsContext();
  const isActive = ctx.value === value;
  const triggerId = `${ctx.baseId}-trigger-${value}`;
  const contentId = `${ctx.baseId}-content-${value}`;
  const merged = {
    ...props,
    "aria-hidden": !isActive,
    "aria-labelledby": triggerId,
    className: cn("flex-1 outline-none", className),
    "data-slot": "tabs-content",
    "data-state": isActive ? "active" : "inactive",
    hidden: !isActive,
    id: contentId,
    role: "tabpanel",
    tabIndex: 0,
  };
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, { ...merged, ref } as never);
  }
  const Component = (as ?? "div") as React.ElementType;
  return (
    <Component {...merged} ref={ref}>
      {children}
    </Component>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
