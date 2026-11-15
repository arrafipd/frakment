"use client";

import { flip, offset, shift, useFloating } from "@floating-ui/react-dom";
import * as React from "react";
import { createPortal } from "react-dom";

import {
  getTransition,
  parseMotion,
  useMotionGuard,
  useReducedMotion,
} from "@/lib/motion";
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
  close: () => void;
  contentId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  registerContent: (el: HTMLDivElement | null) => void;
  registerTrigger: (el: HTMLElement | null) => void;
  setOpen: (open: boolean) => void;
  setOpenDelayed: () => void;
  setResolvedSide: (side: TooltipSide) => void;
  side?: TooltipSide;
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

function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  React.useLayoutEffect(effect, deps);
}

function useMergedRef<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return React.useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  }, refs);
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
  const [resolvedSide, setResolvedSide] = React.useState<
    TooltipSide | undefined
  >(undefined);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentId = React.useId();

  const clearTimer = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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

  const setOpenDelayed = React.useCallback(() => {
    clearTimer();
    if (provider.delayDuration <= 0) {
      setOpen(true);
      return;
    }
    timeoutRef.current = setTimeout(
      () => setOpen(true),
      provider.delayDuration
    );
  }, [clearTimer, provider.delayDuration, setOpen]);

  const close = React.useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer, setOpen]);

  React.useEffect(() => () => clearTimer(), [clearTimer]);

  const registerTrigger = React.useCallback((el: HTMLElement | null) => {
    triggerRef.current = el;
  }, []);
  const registerContent = React.useCallback((el: HTMLDivElement | null) => {
    contentRef.current = el;
  }, []);

  const value = React.useMemo<TooltipContextValue>(
    () => ({
      close,
      contentId,
      contentRef,
      open,
      registerContent,
      registerTrigger,
      setOpen,
      setOpenDelayed,
      setResolvedSide,
      side: resolvedSide,
      triggerRef,
    }),
    [
      close,
      contentId,
      contentRef,
      open,
      registerContent,
      registerTrigger,
      setOpen,
      setOpenDelayed,
      resolvedSide,
      triggerRef,
    ]
  );

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}

type TooltipTriggerProps = Omit<React.ComponentProps<"button">, "ref"> & {
  as?: React.ElementType;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
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
  const setRef = useMergedRef<HTMLElement>(ctx.registerTrigger, ref);
  const isChild = asChild && React.isValidElement(children);
  const Comp = (isChild ? undefined : (as ?? "button")) as React.ElementType;

  const handlers: Record<string, unknown> = {
    "aria-describedby": ctx.open ? ctx.contentId : undefined,
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      onBlur?.(event as React.FocusEvent<HTMLButtonElement>);
      ctx.close();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
      ctx.setOpen(true);
    },
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>);
      ctx.setOpenDelayed();
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>);
      ctx.close();
    },
    ref: setRef,
  };

  if (isChild) {
    return React.cloneElement(children, handlers as Record<string, unknown>);
  }

  return (
    <Comp
      data-slot="tooltip-trigger"
      type={Comp === "button" ? "button" : undefined}
      {...props}
      {...handlers}
    >
      {children}
    </Comp>
  );
}

interface TooltipContentProps extends React.ComponentProps<"div"> {
  align?: TooltipAlign;
  avoidCollisions?: boolean;
  motion?: string;
  side?: TooltipSide;
  sideOffset?: number;
}

const defaultTooltipMotion = "150 cubic-bezier(0.16, 1, 0.3, 1)";

function TooltipContent({
  align = "center",
  avoidCollisions = true,
  children,
  className,
  motion,
  side = "bottom",
  sideOffset = 4,
  style,
  ...props
}: TooltipContentProps) {
  const ctx = useTooltipContext("TooltipContent");
  const reduce = useReducedMotion();
  const motionValue = motion ?? defaultTooltipMotion;
  const [entered, setEntered] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  const placementString =
    align === "center" ? side : (`${side}-${align}` as const);
  const { floatingStyles, placement, refs } = useFloating({
    middleware: [
      offset(sideOffset),
      avoidCollisions ? flip() : undefined,
      avoidCollisions ? shift({ padding: 8 }) : undefined,
    ].filter((x): x is NonNullable<typeof x> => Boolean(x)),
    placement: placementString,
    strategy: "fixed",
  });

  const setRef = useMergedRef<HTMLDivElement>(
    ctx.registerContent,
    internalRef,
    refs.setFloating
  );

  useIsomorphicLayoutEffect(() => {
    const trigger = ctx.triggerRef.current;
    if (!trigger) {
      return;
    }
    refs.setReference(trigger);
  }, [ctx.triggerRef, refs]);

  React.useEffect(() => {
    if (ctx.open) {
      setMounted(true);
    } else if (mounted) {
      setEntered(false);
      const timer = setTimeout(() => setMounted(false), 120);
      return () => clearTimeout(timer);
    }
  }, [ctx.open, mounted]);

  React.useEffect(() => {
    if (!mounted) {
      return;
    }
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
  }, [mounted]);

  const resolvedSide = placement.split("-")[0] as TooltipSide;
  React.useEffect(() => {
    ctx.setResolvedSide(resolvedSide);
  }, [ctx, resolvedSide]);

  let resolvedStyle: React.CSSProperties = {
    ...floatingStyles,
    opacity: reduce ? 1 : entered ? 1 : 0,
    transform: `${floatingStyles.transform ?? ""} ${
      reduce ? "" : entered ? "scale(1)" : "scale(0.96)"
    }`.trim(),
    transformOrigin:
      resolvedSide === "top"
        ? "bottom center"
        : resolvedSide === "bottom"
          ? "top center"
          : resolvedSide === "left"
            ? "center right"
            : "center left",
    ...style,
  };

  if (reduce) {
    resolvedStyle.transition = "none";
  } else {
    const transition = getTransition(parseMotion(motionValue));
    if (transition) {
      resolvedStyle.transition = transition;
    }
  }

  const motionEnabled = !reduce;
  const styleFingerprint = JSON.stringify(resolvedStyle);
  const yielded = useMotionGuard(internalRef, motionEnabled, styleFingerprint);
  if (yielded && !reduce) {
    resolvedStyle = { ...resolvedStyle, transition: "none" };
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "bg-foreground text-background z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md px-3 py-1.5 text-xs",
        className
      )}
      data-align={align}
      data-side={resolvedSide}
      data-slot="tooltip-content"
      data-state={ctx.open ? "open" : "closed"}
      id={ctx.contentId}
      ref={setRef}
      role="tooltip"
      style={resolvedStyle}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
