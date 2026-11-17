"use client";

import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import * as React from "react";
import { createPortal } from "react-dom";

import { getTransition, parseMotion, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const defaultPopoverMotion = "150 cubic-bezier(0.16, 1, 0.3, 1)";

function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  prop: T | undefined;
  defaultProp: T;
  onChange?: (value: T) => void;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolled;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(isControlled ? (prop as T) : uncontrolled)
          : next;
      if (!isControlled) {
        setUncontrolled(resolved);
      }
      onChangeRef.current?.(resolved);
    },
    [isControlled, prop, uncontrolled]
  );
  return [value, setValue];
}

function setRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (!ref) {
    return;
  }
  if (typeof ref === "function") {
    ref(node);
  } else {
    (ref as React.MutableRefObject<T | null>).current = node;
  }
}

function useComposedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  const refsRef = React.useRef(refs);
  refsRef.current = refs;
  return React.useCallback((node: T | null) => {
    for (const ref of refsRef.current) {
      setRef(ref, node);
    }
  }, []);
}

function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: (event: E) => void
) {
  return (event: E) => {
    theirHandler?.(event);
    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}

interface PopoverContextValue {
  anchor: HTMLElement | null;
  contentId: string;
  descriptionId: string;
  descriptionPresent: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
  open: boolean;
  setAnchor: (node: HTMLElement | null) => void;
  setDescriptionCount: React.Dispatch<React.SetStateAction<number>>;
  setTitleCount: React.Dispatch<React.SetStateAction<number>>;
  titleId: string;
  titlePresent: boolean;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Popover`);
  }
  return ctx;
}

export interface PopoverProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function Popover({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
}: PopoverProps) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const [titleCount, setTitleCount] = React.useState(0);
  const [descriptionCount, setDescriptionCount] = React.useState(0);
  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    prop: openProp,
  });
  const contentId = React.useId();
  const titleId = React.useId();
  const descriptionId = React.useId();

  const context = React.useMemo<PopoverContextValue>(
    () => ({
      anchor,
      contentId,
      descriptionId,
      descriptionPresent: descriptionCount > 0,
      onOpenChange: setOpen,
      onOpenToggle: () => setOpen((prev) => !prev),
      open,
      setAnchor,
      setDescriptionCount,
      setTitleCount,
      titleId,
      titlePresent: titleCount > 0,
    }),
    [
      anchor,
      contentId,
      descriptionCount,
      descriptionId,
      open,
      setOpen,
      titleCount,
      titleId,
    ]
  );

  return (
    <PopoverContext.Provider value={context}>
      {children}
    </PopoverContext.Provider>
  );
}

export type PopoverTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "ref"
> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLButtonElement>;
} & Record<string, unknown>;

function PopoverTrigger({ as, onClick, ref, ...props }: PopoverTriggerProps) {
  const { open, contentId, onOpenToggle, setAnchor } =
    usePopoverContext("PopoverTrigger");
  const composedRef = useComposedRefs<HTMLButtonElement>(
    ref as React.Ref<HTMLButtonElement> | undefined,
    setAnchor as unknown as React.Ref<HTMLButtonElement>
  );
  const Component = as ?? "button";
  const finalProps: Record<string, unknown> = {
    ...props,
    "aria-controls": open ? contentId : undefined,
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    "data-state": open ? "open" : "closed",
    onClick: composeEventHandlers(onClick, onOpenToggle),
    ref: composedRef,
  };
  if (!(as || "type" in props)) {
    finalProps.type = "button";
  }
  return React.createElement(Component, finalProps);
}

function useDismissablePopover({
  open,
  contentRef,
  anchor,
  onDismiss,
}: {
  open: boolean;
  contentRef: React.RefObject<HTMLElement | null>;
  anchor: HTMLElement | null;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    if (!open) {
      return;
    }
    const ownerDocument = contentRef.current?.ownerDocument ?? document;
    let isPointerInsideReactTree = false;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideReactTree) {
        const target = event.target as Node;
        if (contentRef.current?.contains(target)) {
          isPointerInsideReactTree = false;
          return;
        }
        if (anchor?.contains(target)) {
          isPointerInsideReactTree = false;
          return;
        }
        onDismiss();
      }
      isPointerInsideReactTree = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      event.preventDefault();
      onDismiss();
    };
    ownerDocument.addEventListener("pointerdown", handlePointerDown);
    ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
    };
  }, [open, contentRef, anchor, onDismiss]);
}

export interface PopoverContentProps extends React.ComponentProps<"div"> {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  motion?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

function PopoverContent({
  align = "center",
  alignOffset = 0,
  avoidCollisions = true,
  className,
  motion,
  side = "bottom",
  sideOffset = 4,
  style,
  ...props
}: PopoverContentProps) {
  const {
    anchor,
    contentId,
    descriptionId,
    descriptionPresent,
    onOpenChange,
    open,
    titleId,
    titlePresent,
  } = usePopoverContext("PopoverContent");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [present, setPresent] = React.useState(open);
  const exitTimerRef = React.useRef<number | undefined>(undefined);
  const { floatingStyles, isPositioned, placement, refs } = useFloating({
    elements: { reference: anchor },
    middleware: [
      offset({ alignmentAxis: alignOffset, mainAxis: sideOffset }),
      avoidCollisions && shift({ padding: 0 }),
      avoidCollisions && flip(),
    ],
    placement: `${side}${align === "center" ? "" : `-${align}`}` as never,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    if (!isPositioned) {
      return;
    }
    let id2: number | undefined;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2 !== undefined) {
        cancelAnimationFrame(id2);
      }
    };
  }, [open, isPositioned]);

  React.useEffect(
    () => () => {
      if (exitTimerRef.current !== undefined) {
        window.clearTimeout(exitTimerRef.current);
      }
    },
    []
  );

  const reduce = useReducedMotion();
  const motionValue = motion ?? defaultPopoverMotion;
  const motionTransition =
    reduce || motion === "off"
      ? "none"
      : getTransition(parseMotion(motionValue));

  React.useEffect(() => {
    if (open) {
      if (exitTimerRef.current !== undefined) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = undefined;
      }
      setPresent(true);
      return;
    }
    if (!present) {
      return;
    }
    const parsed = reduce || motion === "off" ? null : parseMotion(motionValue);
    const duration = parsed && !parsed.disabled ? parsed.duration : 0;
    exitTimerRef.current = window.setTimeout(() => {
      setPresent(false);
      exitTimerRef.current = undefined;
    }, duration + 50);
  }, [open, present, reduce, motion, motionValue]);

  useDismissablePopover({
    anchor,
    contentRef,
    onDismiss: () => onOpenChange(false),
    open,
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = content.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus({ preventScroll: true });
    }
    return () => {
      if (previousFocus?.focus) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!present) {
    return null;
  }

  const [placedSide, placedAlign = "center"] = placement.split("-");

  const originBySide: Record<string, string> = {
    bottom: "top center",
    left: "center right",
    right: "center left",
    top: "bottom center",
  };

  const innerStyle: React.CSSProperties = {
    opacity: entered ? 1 : 0,
    transform: entered ? "scale(1)" : "scale(0.95)",
    transformOrigin: originBySide[placedSide] ?? "center",
    transition: motionTransition ?? "none",
    ...style,
  };

  const node = (
    <div
      data-popper-wrapper=""
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        minWidth: "max-content",
        transform: isPositioned
          ? floatingStyles.transform
          : "translate(0, -200%)",
      }}
    >
      <div
        aria-describedby={descriptionPresent ? descriptionId : undefined}
        aria-labelledby={titlePresent ? titleId : undefined}
        data-align={placedAlign}
        data-side={placedSide}
        data-slot="popover-content"
        data-state={open ? "open" : "closed"}
        id={contentId}
        ref={contentRef}
        role="dialog"
        style={innerStyle}
        {...props}
        className={cn(
          "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none",
          className
        )}
      />
    </div>
  );

  return createPortal(node, document.body);
}

function PopoverHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function PopoverTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { setTitleCount, titleId } = usePopoverContext("PopoverTitle");
  React.useEffect(() => {
    setTitleCount((count) => count + 1);
    return () => setTitleCount((count) => count - 1);
  }, [setTitleCount]);
  return (
    <h2
      className={cn("leading-none font-medium", className)}
      id={titleId}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { setDescriptionCount, descriptionId } =
    usePopoverContext("PopoverDescription");
  React.useEffect(() => {
    setDescriptionCount((count) => count + 1);
    return () => setDescriptionCount((count) => count - 1);
  }, [setDescriptionCount]);
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      id={descriptionId}
      {...props}
    />
  );
}

export type PopoverCloseProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "ref"
> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLButtonElement>;
} & Record<string, unknown>;

function PopoverClose({ as, onClick, ref, ...props }: PopoverCloseProps) {
  const { onOpenChange } = usePopoverContext("PopoverClose");
  const Component = as ?? "button";
  const finalProps: Record<string, unknown> = {
    ...props,
    onClick: composeEventHandlers(onClick, () => onOpenChange(false)),
    ref,
  };
  if (!(as || "type" in props)) {
    finalProps.type = "button";
  }
  return React.createElement(Component, finalProps);
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
