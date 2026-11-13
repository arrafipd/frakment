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

import { cn } from "@/lib/utils";

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
  return React.useCallback((node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  }, refs);
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
  contentId: string;
  descriptionId: string;
  descriptionPresent: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
  open: boolean;
  setDescriptionCount: React.Dispatch<React.SetStateAction<number>>;
  setTitleCount: React.Dispatch<React.SetStateAction<number>>;
  titleId: string;
  titlePresent: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
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
  const triggerRef = React.useRef<HTMLButtonElement>(null);
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
      contentId,
      descriptionId,
      descriptionPresent: descriptionCount > 0,
      onOpenChange: setOpen,
      onOpenToggle: () => setOpen((prev) => !prev),
      open,
      setDescriptionCount,
      setTitleCount,
      titleId,
      titlePresent: titleCount > 0,
      triggerRef,
    }),
    [
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

export interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function PopoverTrigger({ onClick, ...props }: PopoverTriggerProps) {
  const { open, contentId, onOpenToggle, triggerRef } =
    usePopoverContext("PopoverTrigger");
  return (
    <button
      aria-controls={open ? contentId : undefined}
      aria-expanded={open}
      aria-haspopup="dialog"
      data-state={open ? "open" : "closed"}
      ref={triggerRef}
      type="button"
      {...props}
      onClick={composeEventHandlers(onClick, onOpenToggle)}
    />
  );
}

export interface PopoverPortalProps {
  children?: React.ReactNode;
}

function PopoverPortal({ children }: PopoverPortalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return createPortal(children, document.body);
}

function useDismissablePopover({
  open,
  contentRef,
  triggerRef,
  onDismiss,
}: {
  open: boolean;
  contentRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
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
        if (triggerRef.current?.contains(target)) {
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
  }, [open, contentRef, triggerRef, onDismiss]);
}

export interface PopoverContentProps extends React.ComponentProps<"div"> {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

function PopoverContent({
  align = "center",
  alignOffset = 0,
  avoidCollisions = true,
  className,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const {
    contentId,
    open,
    onOpenChange,
    titleId,
    descriptionId,
    titlePresent,
    descriptionPresent,
    triggerRef,
  } = usePopoverContext("PopoverContent");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs<HTMLDivElement>(props.ref, contentRef);

  const { refs, floatingStyles } = useFloating({
    elements: { reference: triggerRef.current },
    middleware: [
      offset({ alignmentAxis: alignOffset, mainAxis: sideOffset }),
      avoidCollisions && shift({ padding: 0 }),
      avoidCollisions && flip(),
    ],
    placement: `${side}${align === "center" ? "" : `-${align}`}` as never,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  React.useEffect(() => {
    if (open && triggerRef.current) {
      refs.setReference(triggerRef.current);
    }
  }, [open, refs, triggerRef]);

  useDismissablePopover({
    contentRef,
    onDismiss: () => onOpenChange(false),
    open,
    triggerRef,
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

  if (!open) {
    return null;
  }

  return (
    <div
      aria-describedby={descriptionPresent ? descriptionId : undefined}
      aria-labelledby={titlePresent ? titleId : undefined}
      data-state={open ? "open" : "closed"}
      id={contentId}
      ref={(node) => {
        refs.setFloating(node);
        composedRef(node);
      }}
      role="dialog"
      style={{ ...floatingStyles, ...props.style }}
      {...props}
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-72 rounded-md border p-4 shadow-md outline-none",
        className
      )}
    />
  );
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

function PopoverClose({
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = usePopoverContext("PopoverClose");
  return (
    <button
      type="button"
      {...props}
      onClick={composeEventHandlers(onClick, () => onOpenChange(false))}
    />
  );
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
};
