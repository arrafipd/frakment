"use client";

import type * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

interface ContextMenuState {
  x: number;
  y: number;
}

interface ContextMenuContextValue {
  close: () => void;
  setState: (state: ContextMenuState | null) => void;
  state: ContextMenuState | null;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("Context menu parts must be used within ContextMenu.");
  }
  return context;
}

function ContextMenu({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContextMenuState | null>(null);
  const close = useCallback(() => setState(null), []);

  return (
    <ContextMenuContext.Provider value={{ close, setState, state }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

function ContextMenuTrigger({
  asChild = false,
  children,
  onContextMenu,
  onKeyDown,
  ...props
}: ContextMenuTriggerProps) {
  const { setState } = useContextMenu();
  const Component = asChild ? Slot : "div";

  return (
    <Component
      data-slot="context-menu-trigger"
      onContextMenu={(event: React.MouseEvent<HTMLElement>) => {
        onContextMenu?.(event);
        if (event.defaultPrevented) {
          return;
        }
        event.preventDefault();
        setState({ x: event.clientX, y: event.clientY });
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          (event.key === "ContextMenu" ||
            (event.shiftKey && event.key === "F10"))
        ) {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          setState({ x: rect.left, y: rect.bottom });
        }
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ContextMenuContent({
  children,
  className,
  onKeyDown,
  ...props
}: ContextMenuContentProps) {
  const { close, state } = useContextMenu();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<ContextMenuState | null>(state);

  useEffect(() => {
    if (!state) {
      return;
    }

    const content = contentRef.current;
    const ownerDocument = content?.ownerDocument;
    const view = ownerDocument?.defaultView;
    if (!(content && ownerDocument && view)) {
      return;
    }

    const updatePosition = () => {
      const rect = content.getBoundingClientRect();
      setPosition({
        x: Math.max(0, Math.min(state.x, view.innerWidth - rect.width)),
        y: Math.max(0, Math.min(state.y, view.innerHeight - rect.height)),
      });
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!content.contains(event.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const items = Array.from(
        content.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not(:disabled)'
        )
      );
      const currentIndex = items.indexOf(
        ownerDocument.activeElement as HTMLButtonElement
      );
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex =
          (currentIndex + direction + items.length) % items.length;
        items[nextIndex]?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        items.at(-1)?.focus();
      }
    };

    updatePosition();
    content
      .querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
    ownerDocument.addEventListener("pointerdown", handlePointerDown);
    ownerDocument.addEventListener("keydown", handleKeyDown);
    view.addEventListener("resize", updatePosition);
    view.addEventListener("scroll", updatePosition, true);

    return () => {
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("keydown", handleKeyDown);
      view.removeEventListener("resize", updatePosition);
      view.removeEventListener("scroll", updatePosition, true);
    };
  }, [close, state]);

  if (!state || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      aria-orientation="vertical"
      className={cn(
        "bg-popover text-popover-foreground z-50 max-h-[calc(100dvh-1rem)] min-w-32 overflow-y-auto rounded-md border p-1 shadow-md",
        className
      )}
      data-slot="context-menu-content"
      ref={contentRef}
      role="menu"
      style={{
        left: position?.x ?? state.x,
        position: "fixed",
        top: position?.y ?? state.y,
      }}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          close();
        }
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface ContextMenuItemProps extends React.ComponentProps<"button"> {
  inset?: boolean;
  variant?: "default" | "destructive";
}

function ContextMenuItem({
  className,
  inset,
  onClick,
  variant = "default",
  ...props
}: ContextMenuItemProps) {
  const { close } = useContextMenu();

  return (
    <button
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-item"
      data-variant={variant}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          close();
        }
      }}
      role="menuitem"
      type="button"
      {...props}
    />
  );
}

export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger };
