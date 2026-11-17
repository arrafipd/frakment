"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type SheetSide = "top" | "right" | "bottom" | "left";

interface SheetContextValue {
  contentRef: React.RefObject<HTMLDivElement | null>;
  descriptionId: string | null;
  open: boolean;
  setDescriptionId: (id: string | null) => void;
  setOpen: (open: boolean) => void;
  setTitleId: (id: string | null) => void;
  titleId: string | null;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext(): SheetContextValue {
  const ctx = React.useContext(SheetContext);
  if (!ctx) {
    throw new Error("Sheet components must be used within <Sheet>.");
  }
  return ctx;
}

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) {
    return [];
  }
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
}

interface SheetProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function Sheet({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: SheetProps) {
  const isControlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolled;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [titleId, setTitleId] = React.useState<string | null>(null);
  const [descriptionId, setDescriptionId] = React.useState<string | null>(null);
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  const ctx = React.useMemo<SheetContextValue>(
    () => ({
      contentRef,
      descriptionId,
      open,
      setDescriptionId,
      setOpen,
      setTitleId,
      titleId,
      triggerRef,
    }),
    [
      contentRef,
      descriptionId,
      open,
      setDescriptionId,
      setOpen,
      setTitleId,
      titleId,
      triggerRef,
    ]
  );
  return (
    <SheetContext.Provider value={ctx}>
      <div data-slot="sheet" data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </SheetContext.Provider>
  );
}

type SheetTriggerProps = Omit<React.ComponentPropsWithoutRef<"button">, "ref"> &
  Record<string, unknown> & {
    as?: React.ElementType;
    asChild?: boolean;
    ref?: React.Ref<HTMLElement>;
  };

function SheetTrigger({
  as,
  asChild,
  children,
  onClick,
  ref,
  ...props
}: SheetTriggerProps) {
  const ctx = useSheetContext();
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
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as never);
    if (event.defaultPrevented) {
      return;
    }
    ctx.setOpen(true);
  };
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLElement>) => void;
      ref?: React.Ref<HTMLElement>;
    }>;
    return React.cloneElement(child, {
      ...props,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event);
        handleClick(event);
      },
      ref: setRef,
    } as never);
  }
  const Component = (as ?? "button") as React.ElementType;
  const isNativeButton = !as;
  return (
    <Component
      data-slot="sheet-trigger"
      {...props}
      {...(isNativeButton ? { type: "button" as const } : {})}
      onClick={handleClick}
      ref={setRef}
    >
      {children}
    </Component>
  );
}

type SheetCloseProps = Omit<React.ComponentPropsWithoutRef<"button">, "ref"> &
  Record<string, unknown> & {
    as?: React.ElementType;
    asChild?: boolean;
    ref?: React.Ref<HTMLElement>;
  };

function SheetClose({
  as,
  asChild,
  children,
  onClick,
  ref,
  ...props
}: SheetCloseProps) {
  const ctx = useSheetContext();
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref]
  );
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as never);
    if (event.defaultPrevented) {
      return;
    }
    ctx.setOpen(false);
  };
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLElement>) => void;
      ref?: React.Ref<HTMLElement>;
    }>;
    return React.cloneElement(child, {
      ...props,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event);
        handleClick(event);
      },
      ref: setRef,
    } as never);
  }
  const Component = (as ?? "button") as React.ElementType;
  const isNativeButton = !as;
  return (
    <Component
      data-slot="sheet-close"
      {...props}
      {...(isNativeButton ? { type: "button" as const } : {})}
      onClick={handleClick}
      ref={setRef}
    >
      {children}
    </Component>
  );
}

function _SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

type SheetOverlayProps = React.ComponentPropsWithoutRef<"div">;

function SheetOverlay({ className, style, ...props }: SheetOverlayProps) {
  const ctx = useSheetContext();
  return (
    <div
      aria-hidden="true"
      data-slot="sheet-overlay"
      data-state={ctx.open ? "open" : "closed"}
      {...props}
      className={className}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          ctx.setOpen(false);
        }
      }}
      style={{
        background: "rgba(0,0,0,0.5)",
        inset: 0,
        opacity: ctx.open ? 1 : 0,
        position: "fixed",
        transition: "opacity 200ms ease-out",
        zIndex: 50,
        ...style,
      }}
    />
  );
}

const sideStyles: Record<SheetSide, string> = {
  bottom: "inset-x-0 bottom-0 h-auto border-t",
  left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  top: "inset-x-0 top-0 h-auto border-b",
};

const sideTransform: Record<SheetSide, string> = {
  bottom: "translateY(100%)",
  left: "translateX(-100%)",
  right: "translateX(100%)",
  top: "translateY(-100%)",
};

type SheetContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "ref"> & {
  side?: SheetSide;
  showCloseButton?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

function SheetContent({
  children,
  className,
  ref,
  showCloseButton = true,
  side = "right",
  style,
  ...props
}: SheetContentProps) {
  const ctx = useSheetContext();
  const { contentRef, descriptionId, open, setOpen, titleId, triggerRef } = ctx;
  const [mounted, setMounted] = React.useState(false);
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  React.useEffect(() => {
    if (!(open && mounted)) {
      return;
    }
    const el = contentRef.current;
    if (el) {
      el.getBoundingClientRect();
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open, mounted, contentRef]);

  React.useEffect(() => {
    if (open) {
      return;
    }
    setEntered(false);
    const timer = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(timer);
  }, [open]);

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

  React.useEffect(() => {
    if (!(open && mounted)) {
      return;
    }
    const prev = document.activeElement as HTMLElement | null;
    const root = contentRef.current;
    if (root) {
      const f = getFocusable(root);
      (f[0] ?? root).focus();
    }
    return () => {
      if (prev && typeof prev.focus === "function") {
        prev.focus();
      } else {
        triggerRef.current?.focus?.();
      }
    };
  }, [open, mounted, contentRef, triggerRef]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const root = contentRef.current;
      if (!root) {
        return;
      }
      const f = getFocusable(root);
      if (f.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = f[0];
      const last = f.at(-1);
      if (!last) {
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen, contentRef]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <SheetOverlay />
      <div
        {...props}
        aria-describedby={descriptionId ?? undefined}
        aria-labelledby={titleId ?? undefined}
        aria-modal="true"
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg",
          sideStyles[side],
          className
        )}
        data-side={side}
        data-slot="sheet-content"
        data-state={open ? "open" : "closed"}
        ref={setRef}
        role="dialog"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translate3d(0,0,0)" : sideTransform[side],
          transition:
            "opacity 200ms ease-out, transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
          ...style,
        }}
        tabIndex={-1}
      >
        {children}
        {showCloseButton && (
          <button
            aria-label="Close"
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            data-slot="sheet-close"
            onClick={() => setOpen(false)}
            type="button"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </>,
    document.body
  );
}

const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex flex-col gap-1.5 p-4", className)}
    data-slot="sheet-header"
    {...props}
  />
);

const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    data-slot="sheet-footer"
    {...props}
  />
);

const SheetTitle = ({
  className,
  id,
  ...props
}: React.ComponentProps<"h2">) => {
  const ctx = useSheetContext();
  const generatedId = React.useId();
  const titleId = id ?? generatedId;
  React.useEffect(() => {
    ctx.setTitleId(titleId);
    return () => ctx.setTitleId(null);
  }, [ctx, titleId]);
  return (
    <h2
      className={cn("text-foreground font-semibold", className)}
      data-slot="sheet-title"
      id={titleId}
      {...props}
    />
  );
};

const SheetDescription = ({
  className,
  id,
  ...props
}: React.ComponentProps<"p">) => {
  const ctx = useSheetContext();
  const generatedId = React.useId();
  const descId = id ?? generatedId;
  React.useEffect(() => {
    ctx.setDescriptionId(descId);
    return () => ctx.setDescriptionId(null);
  }, [ctx, descId]);
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="sheet-description"
      id={descId}
      {...props}
    />
  );
};

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
