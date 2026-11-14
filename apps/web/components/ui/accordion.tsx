"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { getTransition, parseMotion, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const defaultMotion = "450 cubic-bezier(0.32, 0.72, 0, 1)";

type AccordionType = "single" | "multiple";
type AccordionOrientation = "horizontal" | "vertical";

interface AccordionContextValue {
  collapsible: boolean;
  disabled: boolean;
  itemTriggerRefs: React.RefObject<(HTMLButtonElement | null)[]>;
  motion: string | undefined;
  onValueChange: (next: string[]) => void;
  orientation: AccordionOrientation;
  type: AccordionType;
  value: string[];
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null
);

interface AccordionItemContextValue {
  disabled: boolean;
  itemId: string;
  open: boolean;
  value: string;
}

const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

function normalizeValue(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

interface AccordionProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  collapsible?: boolean;
  defaultValue?: string | string[];
  disabled?: boolean;
  motion?: string;
  onValueChange?: ((value: string) => void) | ((value: string[]) => void);
  orientation?: AccordionOrientation;
  type: AccordionType;
  value?: string | string[];
}

function Accordion({
  className,
  children,
  collapsible = false,
  defaultValue,
  disabled = false,
  motion,
  onValueChange,
  orientation = "vertical",
  type,
  value: valueProp,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
    () => normalizeValue(defaultValue)
  );
  const isControlled = valueProp !== undefined;
  const value = isControlled ? normalizeValue(valueProp) : uncontrolledValue;
  const itemTriggerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const setValue = React.useCallback(
    (next: string[]) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      if (onValueChange) {
        if (type === "single") {
          (onValueChange as (v: string) => void)(next[0] ?? "");
        } else {
          (onValueChange as (v: string[]) => void)(next);
        }
      }
    },
    [isControlled, onValueChange, type]
  );

  const ctx: AccordionContextValue = {
    collapsible,
    disabled,
    itemTriggerRefs,
    motion,
    onValueChange: setValue,
    orientation,
    type,
    value,
  };

  return (
    <AccordionContext.Provider value={ctx}>
      <div
        className={className}
        data-orientation={orientation}
        data-slot="accordion"
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.ComponentProps<"div"> {
  disabled?: boolean;
  value: string;
}

function AccordionItem({
  className,
  children,
  disabled = false,
  value,
  ...props
}: AccordionItemProps) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) {
    throw new Error("AccordionItem must be used within Accordion");
  }
  const isDisabled = ctx.disabled || disabled;
  const open = ctx.value.includes(value);
  const itemId = React.useId();

  return (
    <AccordionItemContext.Provider
      value={{ disabled: isDisabled, itemId, open, value }}
    >
      <div
        className={cn("border-b last:border-b-0", className)}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="accordion-item"
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

function AccordionHeader({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("flex", className)}
      data-slot="accordion-header"
      {...props}
    />
  );
}

interface AccordionTriggerProps extends React.ComponentProps<"button"> {}

function AccordionTrigger({
  className,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: AccordionTriggerProps) {
  const ctx = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);
  if (!(ctx && item)) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  const internalRef = React.useRef<HTMLButtonElement>(null);

  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [ref]
  );

  React.useEffect(() => {
    const node = internalRef.current;
    if (!node) {
      return;
    }
    const refs = ctx.itemTriggerRefs.current;
    if (!refs.includes(node)) {
      refs.push(node);
    }
    return () => {
      const idx = refs.indexOf(node);
      if (idx >= 0) {
        refs.splice(idx, 1);
      }
    };
  }, [ctx.itemTriggerRefs]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || item.disabled) {
      return;
    }
    const wasOpen = item.open;
    if (ctx.type === "single") {
      if (wasOpen) {
        if (ctx.collapsible) {
          ctx.onValueChange([]);
        }
      } else {
        ctx.onValueChange([item.value]);
      }
    } else if (wasOpen) {
      ctx.onValueChange(ctx.value.filter((v) => v !== item.value));
    } else {
      ctx.onValueChange([...ctx.value, item.value]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const isVertical = ctx.orientation === "vertical";
    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const isPrev = event.key === prevKey;
    const isNext = event.key === nextKey;
    const isHome = event.key === "Home";
    const isEnd = event.key === "End";
    if (!(isPrev || isNext || isHome || isEnd)) {
      return;
    }
    const refs = ctx.itemTriggerRefs.current;
    const enabled = refs.filter(
      (r): r is HTMLButtonElement => !!r && !r.disabled
    );
    if (enabled.length === 0) {
      return;
    }
    const current = internalRef.current;
    const currentIdx = current ? enabled.indexOf(current) : -1;
    if (currentIdx < 0) {
      return;
    }
    let target: HTMLButtonElement;
    if (isHome) {
      target = enabled[0];
    } else if (isEnd) {
      target = enabled.at(-1) as HTMLButtonElement;
    } else if (isPrev) {
      target = enabled[(currentIdx - 1 + enabled.length) % enabled.length];
    } else {
      target = enabled[(currentIdx + 1) % enabled.length];
    }
    event.preventDefault();
    target.focus();
  };

  return (
    <AccordionHeader>
      <button
        aria-controls={`${item.itemId}-content`}
        aria-expanded={item.open}
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        data-disabled={item.disabled ? "" : undefined}
        data-slot="accordion-trigger"
        data-state={item.open ? "open" : "closed"}
        disabled={item.disabled}
        id={`${item.itemId}-trigger`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={setRef}
        type="button"
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </button>
    </AccordionHeader>
  );
}

interface AccordionContentProps extends React.ComponentProps<"div"> {
  motion?: string | false;
}

function AccordionContent({
  className,
  children,
  motion: localMotion,
  style,
  ...props
}: AccordionContentProps) {
  const ctx = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);
  if (!(ctx && item)) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  const reduce = useReducedMotion();
  const motionProp =
    localMotion === false ? "off" : (localMotion ?? ctx.motion);
  const motionValue = motionProp ?? defaultMotion;

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: item.open ? "1fr" : "0fr",
    opacity: item.open ? 1 : 0,
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
      aria-labelledby={`${item.itemId}-trigger`}
      data-disabled={item.disabled ? "" : undefined}
      data-slot="accordion-content"
      data-state={item.open ? "open" : "closed"}
      id={`${item.itemId}-content`}
      role="region"
      {...props}
    >
      <div inert={!item.open} style={gridStyle}>
        <div style={{ minHeight: 0, overflow: "hidden" }}>
          <div className={cn("pt-0 pb-4", className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
