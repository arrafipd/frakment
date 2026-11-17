"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { parseMotion, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

interface TooltipProviderContextValue {
  delayDuration: number;
}

const TooltipProviderContext = React.createContext<TooltipProviderContextValue>(
  { delayDuration: 0 }
);

interface TooltipContextValue {
  contentId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onTriggerBlur: () => void;
  onTriggerEnter: () => void;
  onTriggerFocus: () => void;
  onTriggerLeave: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string): TooltipContextValue {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Tooltip`);
  }
  return ctx;
}

function computeTooltipPosition(
  trigger: HTMLElement,
  content: HTMLElement,
  side: TooltipSide,
  align: TooltipAlign,
  sideOffset: number,
  avoidCollisions: boolean
): { x: number; y: number; side: TooltipSide } {
  const t = trigger.getBoundingClientRect();
  const c = content.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const place = (s: TooltipSide): { x: number; y: number } => {
    let x = 0;
    let y = 0;
    if (s === "top") {
      x = t.left + (t.width - c.width) / 2;
      y = t.top - c.height - sideOffset;
    } else if (s === "bottom") {
      x = t.left + (t.width - c.width) / 2;
      y = t.bottom + sideOffset;
    } else if (s === "left") {
      x = t.left - c.width - sideOffset;
      y = t.top + (t.height - c.height) / 2;
    } else {
      x = t.right + sideOffset;
      y = t.top + (t.height - c.height) / 2;
    }
    if (s === "top" || s === "bottom") {
      if (align === "start") {
        x = t.left;
      } else if (align === "end") {
        x = t.right - c.width;
      }
    } else if (align === "start") {
      y = t.top;
    } else if (align === "end") {
      y = t.bottom - c.height;
    }
    return { x, y };
  };

  let resolvedSide = side;
  const placed = place(resolvedSide);
  let x = placed.x;
  let y = placed.y;

  if (avoidCollisions) {
    const pad = 8;
    const over = {
      bottom: y + c.height > vh - pad,
      left: x < pad,
      right: x + c.width > vw - pad,
      top: y < pad,
    };
    const flipMap: Record<TooltipSide, TooltipSide> = {
      bottom: "top",
      left: "right",
      right: "left",
      top: "bottom",
    };
    if (over[resolvedSide]) {
      const flipped = flipMap[resolvedSide];
      const fp = place(flipped);
      const flipOver =
        fp.y < pad ||
        fp.y + c.height > vh - pad ||
        fp.x < pad ||
        fp.x + c.width > vw - pad;
      if (!flipOver) {
        resolvedSide = flipped;
        x = fp.x;
        y = fp.y;
      }
    }
    if (x < pad) {
      x = pad;
    }
    if (x + c.width > vw - pad) {
      x = vw - c.width - pad;
    }
    if (y < pad) {
      y = pad;
    }
    if (y + c.height > vh - pad) {
      y = vh - c.height - pad;
    }
  }

  return { side: resolvedSide, x, y };
}

interface TooltipProviderProps {
  children?: React.ReactNode;
  delayDuration?: number;
}

function TooltipProvider({
  children,
  delayDuration = 0,
}: TooltipProviderProps) {
  const value = React.useMemo(() => ({ delayDuration }), [delayDuration]);
  return (
    <TooltipProviderContext.Provider value={value}>
      {children}
    </TooltipProviderContext.Provider>
  );
}

interface TooltipProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function Tooltip({
  children,
  defaultOpen = false,
  onOpenChange,
  open: openProp,
}: TooltipProps) {
  const provider = React.useContext(TooltipProviderContext);
  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolledOpen;
  const contentId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = React.useCallback(() => {
    if (openTimer.current !== null) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const onTriggerEnter = React.useCallback(() => {
    clearTimers();
    if (provider.delayDuration > 0) {
      openTimer.current = setTimeout(
        () => setOpen(true),
        provider.delayDuration
      );
    } else {
      setOpen(true);
    }
  }, [clearTimers, provider.delayDuration, setOpen]);

  const onTriggerLeave = React.useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  }, [clearTimers, setOpen]);

  const onContentEnter = React.useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const onContentLeave = React.useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  }, [clearTimers, setOpen]);

  const onTriggerFocus = React.useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers, setOpen]);

  const onTriggerBlur = React.useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 0);
  }, [clearTimers, setOpen]);

  React.useEffect(
    () => () => {
      clearTimers();
    },
    [clearTimers]
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimers();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, clearTimers, setOpen]);

  const value = React.useMemo<TooltipContextValue>(
    () => ({
      contentId,
      contentRef,
      onContentEnter,
      onContentLeave,
      onTriggerBlur,
      onTriggerEnter,
      onTriggerFocus,
      onTriggerLeave,
      open,
      setOpen,
      triggerRef,
    }),
    [
      contentId,
      onContentEnter,
      onContentLeave,
      onTriggerBlur,
      onTriggerEnter,
      onTriggerFocus,
      onTriggerLeave,
      open,
      setOpen,
    ]
  );

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}

type TooltipTriggerProps = Omit<React.ComponentProps<"button">, "ref"> & {
  as?: React.ElementType;
  asChild?: boolean;
  ref?: React.Ref<HTMLElement>;
} & Record<string, unknown>;

function TooltipTrigger({
  as,
  asChild = false,
  children,
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ref,
  ...props
}: TooltipTriggerProps) {
  const ctx = useTooltipContext("TooltipTrigger");

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

  const handlers: Record<string, unknown> = {
    "aria-describedby": ctx.open ? ctx.contentId : undefined,
    "data-state": ctx.open ? "open" : "closed",
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      (onBlur as ((e: React.FocusEvent<HTMLElement>) => void) | undefined)?.(
        event
      );
      ctx.onTriggerBlur();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      (onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined)?.(
        event
      );
      ctx.onTriggerFocus();
    },
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      (
        onPointerEnter as
          | ((e: React.PointerEvent<HTMLElement>) => void)
          | undefined
      )?.(event);
      ctx.onTriggerEnter();
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      (
        onPointerLeave as
          | ((e: React.PointerEvent<HTMLElement>) => void)
          | undefined
      )?.(event);
      ctx.onTriggerLeave();
    },
    ref: setRef,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<Record<string, unknown>>,
      handlers
    );
  }

  const Comp = (as ?? "button") as React.ElementType;
  const isNativeButton = Comp === "button";

  return (
    <Comp
      data-slot="tooltip-trigger"
      type={isNativeButton ? ((props.type as string) ?? "button") : undefined}
      {...props}
      {...handlers}
    >
      {children}
    </Comp>
  );
}

interface TooltipContentProps extends Omit<React.ComponentProps<"div">, "ref"> {
  align?: TooltipAlign;
  avoidCollisions?: boolean;
  motion?: string;
  ref?: React.Ref<HTMLDivElement>;
  side?: TooltipSide;
  sideOffset?: number;
}

const defaultTooltipMotion = "120 ease-out";

function TooltipContent({
  align = "center",
  avoidCollisions = true,
  children,
  className,
  motion,
  ref,
  side = "bottom",
  sideOffset = 10,
  style,
  ...props
}: TooltipContentProps) {
  const ctx = useTooltipContext("TooltipContent");
  const reduce = useReducedMotion();
  const motionValue = motion ?? defaultTooltipMotion;
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = React.useState(false);
  const [present, setPresent] = React.useState(false);
  const [resolvedSide, setResolvedSide] = React.useState<TooltipSide>(side);
  const [pos, setPos] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      ctx.contentRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ctx.contentRef, ref]
  );

  React.useLayoutEffect(() => {
    if (!present) {
      return;
    }
    const trigger = ctx.triggerRef.current;
    const content = internalRef.current;
    if (!(trigger && content)) {
      return;
    }
    const update = () => {
      const t = ctx.triggerRef.current;
      const c = internalRef.current;
      if (!(t && c)) {
        return;
      }
      const next = computeTooltipPosition(
        t,
        c,
        side,
        align,
        sideOffset,
        avoidCollisions
      );
      setPos({ x: next.x, y: next.y });
      setResolvedSide(next.side);
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(trigger);
      observer.observe(content);
    }
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [present, side, align, sideOffset, avoidCollisions, ctx.triggerRef]);

  const parsedMotion = parseMotion(motionValue);
  const exitDuration =
    reduce || parsedMotion?.disabled ? 0 : (parsedMotion?.duration ?? 120);

  React.useEffect(() => {
    if (ctx.open) {
      setPresent(true);
      let raf1 = 0;
      let raf2 = 0;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        if (raf1) {
          cancelAnimationFrame(raf1);
        }
        if (raf2) {
          cancelAnimationFrame(raf2);
        }
      };
    }
    setEntered(false);
    const timer = setTimeout(() => setPresent(false), exitDuration);
    return () => clearTimeout(timer);
  }, [ctx.open, exitDuration]);

  if (!present) {
    return null;
  }

  const baseStyle: React.CSSProperties = {
    left: pos.x,
    opacity: reduce ? 1 : entered ? 1 : 0,
    position: "fixed",
    top: pos.y,
    ...style,
  };

  if (reduce) {
    baseStyle.transition = "none";
  } else {
    const parsed = parseMotion(motionValue);
    if (parsed?.disabled) {
      baseStyle.transition = "none";
    } else if (parsed) {
      baseStyle.transition = `opacity ${parsed.duration}ms ${parsed.easing}`;
    } else {
      baseStyle.transition = "opacity 120ms ease-out, transform 120ms ease-out";
    }
  }

  const arrowSize = 8;
  const arrowStyle: React.CSSProperties = {
    background: "var(--foreground)",
    height: arrowSize,
    position: "absolute",
    transform: "rotate(45deg)",
    width: arrowSize,
  };
  if (resolvedSide === "top") {
    arrowStyle.bottom = -arrowSize / 4;
    if (align === "start") {
      arrowStyle.left = 12;
    } else if (align === "end") {
      arrowStyle.right = 12;
    } else {
      arrowStyle.left = "50%";
      arrowStyle.marginLeft = -arrowSize / 2;
    }
  } else if (resolvedSide === "bottom") {
    arrowStyle.top = -arrowSize / 4;
    if (align === "start") {
      arrowStyle.left = 12;
    } else if (align === "end") {
      arrowStyle.right = 12;
    } else {
      arrowStyle.left = "50%";
      arrowStyle.marginLeft = -arrowSize / 2;
    }
  } else if (resolvedSide === "left") {
    arrowStyle.right = -arrowSize / 4;
    if (align === "start") {
      arrowStyle.top = 12;
    } else if (align === "end") {
      arrowStyle.bottom = 12;
    } else {
      arrowStyle.top = "50%";
      arrowStyle.marginTop = -arrowSize / 2;
    }
  } else {
    arrowStyle.left = -arrowSize / 4;
    if (align === "start") {
      arrowStyle.top = 12;
    } else if (align === "end") {
      arrowStyle.bottom = 12;
    } else {
      arrowStyle.top = "50%";
      arrowStyle.marginTop = -arrowSize / 2;
    }
  }

  return createPortal(
    <div
      className={cn(
        "bg-foreground text-background z-50 inline-flex w-fit max-w-xs items-center gap-1.5 overflow-visible rounded-md px-3 py-1.5 text-xs",
        className
      )}
      data-align={align}
      data-side={resolvedSide}
      data-slot="tooltip-content"
      data-state={ctx.open ? "open" : "closed"}
      id={ctx.contentId}
      onPointerEnter={ctx.onContentEnter}
      onPointerLeave={ctx.onContentLeave}
      ref={setRef}
      role="tooltip"
      style={baseStyle}
      {...props}
    >
      <span aria-hidden="true" style={arrowStyle} />
      {children}
    </div>,
    document.body
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
