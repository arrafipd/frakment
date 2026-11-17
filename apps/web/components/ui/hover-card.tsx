"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

interface HoverCardContextValue {
  contentRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  scheduleClose: () => void;
  scheduleOpen: () => void;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(
  null
);

function useHoverCardContext(): HoverCardContextValue {
  const ctx = React.useContext(HoverCardContext);
  if (!ctx) {
    throw new Error("HoverCard components must be used within <HoverCard>.");
  }
  return ctx;
}

interface HoverCardProps {
  children?: React.ReactNode;
  closeDelay?: number;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  openDelay?: number;
}

function HoverCard({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
}: HoverCardProps) {
  const isControlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolled;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const openTimerRef = React.useRef<number | null>(null);
  const closeTimerRef = React.useRef<number | null>(null);
  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  const scheduleOpen = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (open) {
      return;
    }
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setOpen(true);
    }, openDelay);
  }, [open, openDelay, setOpen]);
  const scheduleClose = React.useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (!open) {
      return;
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, closeDelay);
  }, [open, closeDelay, setOpen]);
  React.useEffect(() => clearTimers, [clearTimers]);
  const ctx = React.useMemo<HoverCardContextValue>(
    () => ({
      contentRef,
      open,
      scheduleClose,
      scheduleOpen,
      setOpen,
      triggerRef,
    }),
    [open, setOpen, scheduleOpen, scheduleClose]
  );
  return (
    <HoverCardContext.Provider value={ctx}>
      {children}
    </HoverCardContext.Provider>
  );
}

type HoverCardTriggerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "ref"
> &
  Record<string, unknown> & {
    as?: React.ElementType;
    asChild?: boolean;
    ref?: React.Ref<HTMLElement>;
  };

function HoverCardTrigger({
  as,
  asChild,
  children,
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ref,
  ...props
}: HoverCardTriggerProps) {
  const ctx = useHoverCardContext();
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      ctx.triggerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ctx.triggerRef, ref]
  );
  const handlers = {
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      onBlur?.(e as never);
      if (!e.defaultPrevented) {
        ctx.scheduleClose();
      }
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      onFocus?.(e as never);
      if (!e.defaultPrevented) {
        ctx.scheduleOpen();
      }
    },
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      onPointerEnter?.(e as never);
      if (!e.defaultPrevented) {
        ctx.scheduleOpen();
      }
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      onPointerLeave?.(e as never);
      if (!e.defaultPrevented) {
        ctx.scheduleClose();
      }
    },
  };
  const state = ctx.open ? "open" : "closed";
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      ...handlers,
      "data-slot": "hover-card-trigger",
      "data-state": state,
      ref: setRef,
    } as never);
  }
  const Component = (as ?? "button") as React.ElementType;
  const isNativeButton = !as;
  return (
    <Component
      data-slot="hover-card-trigger"
      data-state={state}
      {...props}
      {...(isNativeButton ? { type: "button" as const } : {})}
      {...handlers}
      ref={setRef}
    >
      {children}
    </Component>
  );
}

type HoverCardContentProps = React.ComponentPropsWithoutRef<"div"> & {
  align?: Align;
  side?: Side;
  sideOffset?: number;
  ref?: React.Ref<HTMLDivElement>;
};

interface Position {
  left: number;
  side: Side;
  top: number;
}

function computePosition(
  trigger: HTMLElement,
  content: HTMLElement,
  side: Side,
  align: Align,
  offset: number
): Position {
  const t = trigger.getBoundingClientRect();
  const c = content.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let actualSide: Side = side;
  if (
    side === "bottom" &&
    t.bottom + offset + c.height > vh &&
    t.top > vh - t.bottom
  ) {
    actualSide = "top";
  } else if (
    side === "top" &&
    t.top - offset - c.height < 0 &&
    vh - t.bottom > t.top
  ) {
    actualSide = "bottom";
  } else if (
    side === "right" &&
    t.right + offset + c.width > vw &&
    t.left > vw - t.right
  ) {
    actualSide = "left";
  } else if (
    side === "left" &&
    t.left - offset - c.width < 0 &&
    vw - t.right > t.left
  ) {
    actualSide = "right";
  }
  let top = 0;
  let left = 0;
  if (actualSide === "bottom") {
    top = t.bottom + offset;
  } else if (actualSide === "top") {
    top = t.top - c.height - offset;
  } else if (actualSide === "right") {
    top = t.top + (t.height - c.height) / 2;
  } else {
    top = t.top + (t.height - c.height) / 2;
  }
  if (actualSide === "bottom" || actualSide === "top") {
    if (align === "start") {
      left = t.left;
    } else if (align === "end") {
      left = t.right - c.width;
    } else {
      left = t.left + (t.width - c.width) / 2;
    }
  } else if (actualSide === "right") {
    left = t.right + offset;
  } else {
    left = t.left - c.width - offset;
  }
  left = Math.max(8, Math.min(left, vw - c.width - 8));
  top = Math.max(8, Math.min(top, vh - c.height - 8));
  return { left, side: actualSide, top };
}

function HoverCardContent({
  align = "center",
  children,
  className,
  ref,
  side = "bottom",
  sideOffset = 4,
  style,
  ...props
}: HoverCardContentProps) {
  const ctx = useHoverCardContext();
  const { open, setOpen, triggerRef, contentRef, scheduleOpen, scheduleClose } =
    ctx;
  const [mounted, setMounted] = React.useState(open);
  const [pos, setPos] = React.useState<Position>({ left: 0, side, top: 0 });
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [contentRef, ref]
  );
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
    setEntered(false);
    const timer = window.setTimeout(() => setMounted(false), 100);
    return () => window.clearTimeout(timer);
  }, [open]);
  React.useLayoutEffect(() => {
    if (!mounted) {
      return;
    }
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!(trigger && content)) {
      return;
    }
    const update = () =>
      setPos(computePosition(trigger, content, side, align, sideOffset));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(trigger);
    ro.observe(content);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [mounted, align, side, sideOffset, triggerRef, contentRef]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  if (!mounted || typeof document === "undefined") {
    return null;
  }
  return createPortal(
    <div
      data-side={pos.side}
      data-slot="hover-card-content"
      data-state={open ? "open" : "closed"}
      {...props}
      className={cn(
        "bg-popover dark:bg-card text-popover-foreground ring-foreground/10 fixed z-50 w-64 rounded-lg p-3 text-sm shadow-sm ring-1 outline-hidden",
        className
      )}
      onPointerEnter={() => scheduleOpen()}
      onPointerLeave={() => scheduleClose()}
      ref={setRef}
      style={{
        left: pos.left,
        opacity: entered ? 1 : 0,
        top: pos.top,
        transform: `scale(${entered ? 1 : 0.95})`,
        transition: "opacity 100ms ease-out, transform 100ms ease-out",
        ...style,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
