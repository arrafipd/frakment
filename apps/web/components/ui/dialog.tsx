"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { getTransition, parseMotion, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  contentRef: React.RefObject<HTMLDivElement | null>;
  descriptionId: string | null;
  open: boolean;
  setDescriptionId: (id: string | null) => void;
  setOpen: (open: boolean) => void;
  setTitleId: (id: string | null) => void;
  titleId: string | null;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog components must be used within <Dialog>.");
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

interface DialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function Dialog({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) {
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
  const ctx = React.useMemo<DialogContextValue>(
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
    [open, setOpen, titleId, descriptionId]
  );
  return (
    <DialogContext.Provider value={ctx}>
      <div data-slot="dialog" data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "ref"
> & {
  as?: React.ElementType;
  asChild?: boolean;
  ref?: React.Ref<HTMLElement>;
};

function DialogTrigger({
  as,
  asChild,
  children,
  onClick,
  ref,
  ...props
}: DialogTriggerProps) {
  const ctx = useDialogContext();
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
      data-slot="dialog-trigger"
      {...props}
      {...(isNativeButton ? { type: "button" as const } : {})}
      onClick={handleClick}
      ref={setRef}
    >
      {children}
    </Component>
  );
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

type DialogCloseProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "ref"
> & {
  as?: React.ElementType;
  asChild?: boolean;
  ref?: React.Ref<HTMLElement>;
};

function DialogClose({
  as,
  asChild,
  children,
  onClick,
  ref,
  ...props
}: DialogCloseProps) {
  const ctx = useDialogContext();
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
      data-slot="dialog-close"
      {...props}
      {...(isNativeButton ? { type: "button" as const } : {})}
      onClick={handleClick}
      ref={setRef}
    >
      {children}
    </Component>
  );
}

type DialogOverlayProps = React.ComponentPropsWithoutRef<"div"> & {
  motion?: string;
};

function DialogOverlay({
  className,
  motion,
  style,
  ...props
}: DialogOverlayProps) {
  const ctx = useDialogContext();
  const reduce = useReducedMotion();
  const transition = reduce
    ? "none"
    : (getTransition(parseMotion(motion)) ?? "opacity 150ms ease-out");
  return (
    <div
      aria-hidden="true"
      className={className}
      data-slot="dialog-overlay"
      data-state={ctx.open ? "open" : "closed"}
      {...props}
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
        transition,
        zIndex: 50,
        ...style,
      }}
    />
  );
}

type DialogContentProps = React.ComponentPropsWithoutRef<"div"> & {
  showCloseButton?: boolean;
  motion?: string;
};

function DialogContent({
  children,
  className,
  motion,
  showCloseButton = true,
  style,
  ...props
}: DialogContentProps) {
  const ctx = useDialogContext();
  const { open, setOpen, contentRef, triggerRef, titleId, descriptionId } = ctx;
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [entered, setEntered] = React.useState(false);
  const transition = reduce
    ? "none"
    : (getTransition(parseMotion(motion)) ??
      "opacity 150ms ease-out, transform 150ms ease-out");
  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(false), 150);
    return () => clearTimeout(t);
  }, [open]);
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
  if (!mounted) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }
  const content = (
    <>
      <DialogOverlay motion={motion} />
      <div
        aria-describedby={descriptionId ?? undefined}
        aria-labelledby={titleId ?? undefined}
        aria-modal="true"
        className={cn(
          "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg",
          className
        )}
        data-slot="dialog-content"
        data-state={open ? "open" : "closed"}
        ref={contentRef}
        role="dialog"
        tabIndex={-1}
        {...props}
        style={{
          opacity: entered ? 1 : 0,
          overscrollBehavior: "contain",
          transform: `translate(-50%, -50%) scale(${entered ? 1 : 0.95})`,
          transition,
          ...style,
        }}
      >
        {children}
        {showCloseButton && (
          <DialogClose className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </div>
    </>
  );
  return createPortal(content, document.body);
}

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    data-slot="dialog-header"
    {...props}
  />
);

const DialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    data-slot="dialog-footer"
    {...props}
  />
);

const DialogTitle = ({
  className,
  id,
  ...props
}: React.ComponentProps<"h2">) => {
  const ctx = useDialogContext();
  const generatedId = React.useId();
  const titleId = id ?? generatedId;
  React.useEffect(() => {
    ctx.setTitleId(titleId);
    return () => ctx.setTitleId(null);
  }, [ctx, titleId]);
  return (
    <h2
      className={cn("text-lg leading-none font-semibold", className)}
      data-slot="dialog-title"
      id={titleId}
      {...props}
    />
  );
};

const DialogDescription = ({
  className,
  id,
  ...props
}: React.ComponentProps<"p">) => {
  const ctx = useDialogContext();
  const generatedId = React.useId();
  const descId = id ?? generatedId;
  React.useEffect(() => {
    ctx.setDescriptionId(descId);
    return () => ctx.setDescriptionId(null);
  }, [ctx, descId]);
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="dialog-description"
      id={descId}
      {...props}
    />
  );
};

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
