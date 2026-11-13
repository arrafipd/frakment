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

const SELECTION_KEYS = ["Enter", " "];
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
const LAST_KEYS = ["ArrowUp", "PageDown", "End"];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SUB_OPEN_KEYS = [...SELECTION_KEYS, "ArrowRight"];
const SUB_CLOSE_KEYS = ["ArrowLeft"];

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
  their: ((event: E) => void) | undefined,
  ours: (event: E) => void
) {
  return (event: E) => {
    their?.(event);
    if (!event.defaultPrevented) {
      ours(event);
    }
  };
}

function getOpenState(open: boolean) {
  return open ? "open" : "closed";
}

function focusFirst(candidates: HTMLElement[]) {
  const prev = document.activeElement;
  for (const c of candidates) {
    if (c === prev) {
      return;
    }
    c.focus();
    if (document.activeElement !== prev) {
      return;
    }
  }
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, i) => array[(startIndex + i) % array.length] as T);
}

function getNextMatch(values: string[], search: string, currentMatch?: string) {
  const isRepeated =
    search.length > 1 && Array.from(search).every((c) => c === search[0]);
  const normalizedSearch = isRepeated ? (search[0] as string) : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrapped = wrapArray(values, Math.max(currentMatchIndex, 0));
  if (normalizedSearch.length === 1) {
    wrapped = wrapped.filter((v) => v !== currentMatch);
  }
  const nextMatch = wrapped.find((v) =>
    v.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextMatch === currentMatch ? undefined : nextMatch;
}

interface ItemData {
  disabled: boolean;
  ref: React.RefObject<HTMLElement | null>;
  textValue: string;
}

interface DropdownMenuContextValue {
  contentId: string;
  contentRef: React.RefObject<HTMLElement | null>;
  getItems: () => ItemData[];
  isUsingKeyboardRef: React.RefObject<boolean>;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
  open: boolean;
  registerItem: (id: string, data: ItemData) => void;
  searchRef: React.MutableRefObject<string>;
  triggerId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  unregisterItem: (id: string) => void;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(`${component} must be used within DropdownMenu`);
  }
  return ctx;
}

export interface DropdownMenuProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function DropdownMenu({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const isUsingKeyboardRef = React.useRef(false);
  const searchRef = React.useRef("");
  const itemsMap = React.useRef(new Map<string, ItemData>());
  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    prop: openProp,
  });
  const contentId = React.useId();
  const triggerId = React.useId();

  React.useEffect(() => {
    const handleKeyDown = () => {
      isUsingKeyboardRef.current = true;
      document.addEventListener("pointerdown", handlePointer, {
        capture: true,
        once: true,
      });
      document.addEventListener("pointermove", handlePointer, {
        capture: true,
        once: true,
      });
    };
    const handlePointer = () => {
      isUsingKeyboardRef.current = false;
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("pointerdown", handlePointer, {
        capture: true,
      });
      document.removeEventListener("pointermove", handlePointer, {
        capture: true,
      });
    };
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const handleBlur = () => setOpen(false);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [open, setOpen]);

  const context = React.useMemo<DropdownMenuContextValue>(
    () => ({
      contentId,
      contentRef,
      getItems: () => Array.from(itemsMap.current.values()),
      isUsingKeyboardRef,
      onOpenChange: setOpen,
      onOpenToggle: () => setOpen((prev) => !prev),
      open,
      registerItem: (id, data) => {
        itemsMap.current.set(id, data);
      },
      searchRef,
      triggerId,
      triggerRef,
      unregisterItem: (id) => {
        itemsMap.current.delete(id);
      },
    }),
    [open, setOpen, contentId, triggerId]
  );

  return (
    <DropdownMenuContext.Provider value={context}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export type DropdownMenuTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "ref"
> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLButtonElement>;
} & Record<string, unknown>;

function DropdownMenuTrigger({
  as,
  disabled,
  onClick,
  onKeyDown,
  onPointerDown,
  ref,
  ...props
}: DropdownMenuTriggerProps) {
  const ctx = useDropdownMenuContext("DropdownMenuTrigger");
  const composedRef = useComposedRefs<HTMLButtonElement>(
    ref as React.Ref<HTMLButtonElement> | undefined,
    ctx.triggerRef as unknown as React.Ref<HTMLButtonElement>
  );
  const Component = as ?? "button";
  const finalProps: Record<string, unknown> = {
    ...props,
    "aria-controls": ctx.open ? ctx.contentId : undefined,
    "aria-expanded": ctx.open,
    "aria-haspopup": "menu",
    "data-disabled": disabled ? "" : undefined,
    "data-state": getOpenState(ctx.open),
    disabled,
    id: ctx.triggerId,
    onClick: onClick as
      | ((e: React.MouseEvent<HTMLButtonElement>) => void)
      | undefined,
    onKeyDown: composeEventHandlers(
      onKeyDown as
        | ((e: React.KeyboardEvent<HTMLButtonElement>) => void)
        | undefined,
      (event) => {
        if (disabled) {
          return;
        }
        if (["Enter", " "].includes(event.key)) {
          ctx.onOpenToggle();
        }
        if (event.key === "ArrowDown") {
          ctx.onOpenChange(true);
        }
        if (["Enter", " ", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
        }
      }
    ),
    onPointerDown: composeEventHandlers(
      onPointerDown as
        | ((e: React.PointerEvent<HTMLButtonElement>) => void)
        | undefined,
      (event) => {
        if (!disabled && event.button === 0 && event.ctrlKey === false) {
          ctx.onOpenToggle();
          if (!ctx.open) {
            event.preventDefault();
          }
        }
      }
    ),
    ref: composedRef,
  };
  if (!(as || "type" in props)) {
    finalProps.type = "button";
  }
  return React.createElement(Component, finalProps);
}

interface DropdownMenuPortalProps {
  children?: React.ReactNode;
}

function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  return children as React.ReactElement;
}
export interface DropdownMenuContentProps extends React.ComponentProps<"div"> {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  avoidCollisions = true,
  className,
  collisionPadding = 0,
  side = "bottom",
  sideOffset = 4,
  onKeyDown,
  ...props
}: DropdownMenuContentProps) {
  const ctx = useDropdownMenuContext("DropdownMenuContent");
  const { refs, floatingStyles, isPositioned } = useFloating({
    elements: { reference: ctx.triggerRef.current },
    middleware: [
      offset({ alignmentAxis: alignOffset, mainAxis: sideOffset }),
      avoidCollisions && shift({ padding: collisionPadding }),
      avoidCollisions && flip({ padding: collisionPadding }),
    ],
    placement: (side + (align === "center" ? "" : `-${align}`)) as never,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });
  React.useEffect(() => {
    if (ctx.open && ctx.triggerRef.current) {
      refs.setReference(ctx.triggerRef.current);
    }
  }, [ctx.open, refs, ctx.triggerRef]);

  React.useEffect(() => {
    if (!ctx.open) {
      return;
    }
    const content = ctx.contentRef.current;
    if (!content) {
      return;
    }
    const prev = document.activeElement as HTMLElement | null;
    content.focus({ preventScroll: true });
    return () => {
      if (prev?.focus) {
        prev.focus({ preventScroll: true });
      }
    };
  }, [ctx.open, ctx.contentRef]);

  React.useEffect(() => {
    if (!ctx.open) {
      return;
    }
    const ownerDocument = ctx.contentRef.current?.ownerDocument ?? document;
    let isPointerInsideReactTree = false;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideReactTree) {
        const target = event.target as Node;
        if (ctx.contentRef.current?.contains(target)) {
          isPointerInsideReactTree = false;
          return;
        }
        if (ctx.triggerRef.current?.contains(target)) {
          isPointerInsideReactTree = false;
          return;
        }
        ctx.onOpenChange(false);
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
      ctx.onOpenChange(false);
    };
    ownerDocument.addEventListener("pointerdown", handlePointerDown);
    ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
    };
  }, [ctx.open, ctx.contentRef, ctx.triggerRef, ctx.onOpenChange]);

  if (!ctx.open) {
    return null;
  }

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const target = event.target as HTMLElement;
    const isKeyDownInside =
      target.closest("[data-slot=dropdown-menu-content]") ===
      event.currentTarget;
    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
    const isCharacterKey = event.key.length === 1;
    if (isKeyDownInside) {
      if (event.key === "Tab") {
        event.preventDefault();
      }
      if (!isModifierKey && isCharacterKey) {
        const search = ctx.searchRef.current + event.key;
        const items = ctx.getItems().filter((i) => !i.disabled);
        const currentMatch = items.find(
          (i) => i.ref.current === document.activeElement
        )?.textValue;
        const values = items.map((i) => i.textValue);
        const nextMatch = getNextMatch(values, search, currentMatch);
        const newItem = items.find((i) => i.textValue === nextMatch)?.ref
          .current;
        const update = (val: string) => {
          ctx.searchRef.current = val;
          if (val !== "") {
            window.setTimeout(() => update(""), 1000);
          }
        };
        update(search);
        if (newItem) {
          setTimeout(() => (newItem as HTMLElement).focus());
        }
      }
    }
    const content = ctx.contentRef.current;
    if (event.target !== content) {
      return;
    }
    if (!FIRST_LAST_KEYS.includes(event.key)) {
      return;
    }
    event.preventDefault();
    const items = ctx.getItems().filter((i) => !i.disabled);
    const candidates = items
      .map((i) => i.ref.current)
      .filter((n): n is HTMLElement => n !== null);
    if (LAST_KEYS.includes(event.key)) {
      candidates.reverse();
    }
    focusFirst(candidates);
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
        aria-labelledby={ctx.triggerId}
        data-slot="dropdown-menu-content"
        data-state={getOpenState(ctx.open)}
        id={ctx.contentId}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.target)) {
            ctx.searchRef.current = "";
          }
        }}
        ref={ctx.contentRef as unknown as React.Ref<HTMLDivElement>}
        role="menu"
        tabIndex={-1}
        {...props}
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-y-auto rounded-md border p-1 shadow-md outline-none",
          className
        )}
        onKeyDown={handleContentKeyDown}
      />
    </div>
  );

  return createPortal(node, document.body);
}

function DropdownMenuGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} role="group" {...props} />;
}

function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-medium", className)}
      {...props}
    />
  );
}

export type DropdownMenuItemProps = Omit<
  React.ComponentProps<"div">,
  "onSelect"
> & {
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  textValue?: string;
} & Record<string, unknown>;

function DropdownMenuItem({
  className,
  disabled = false,
  inset,
  onSelect,
  textValue,
  variant = "default",
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onKeyDown,
  ...props
}: DropdownMenuItemProps & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  const ctx = useDropdownMenuContext("DropdownMenuItem");
  const ref = React.useRef<HTMLDivElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [textContent, setTextContent] = React.useState("");
  const isPointerDownRef = React.useRef(false);
  const id = React.useId();

  React.useEffect(() => {
    if (ref.current) {
      setTextContent((ref.current.textContent ?? "").trim());
    }
  }, [children]);

  React.useEffect(() => {
    ctx.registerItem(id, {
      disabled,
      ref,
      textValue: textValue ?? textContent,
    });
    return () => ctx.unregisterItem(id);
  }, [ctx, id, textValue, textContent, disabled]);

  const handleSelect = () => {
    const item = ref.current;
    if (!disabled && item) {
      const ev = new CustomEvent("menu.itemSelect", {
        bubbles: true,
        cancelable: true,
      });
      item.addEventListener("menu.itemSelect", (event) => onSelect?.(event), {
        once: true,
      });
      item.dispatchEvent(ev);
      if (ev.defaultPrevented) {
        isPointerDownRef.current = false;
      } else {
        ctx.onOpenChange(false);
      }
    }
  };

  return (
    <div
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      data-highlighted={focused ? "" : undefined}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      ref={ref}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      {...props}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4",
        className
      )}
      onBlur={() => setFocused(false)}
      onClick={composeEventHandlers(
        onClick as ((e: React.MouseEvent<HTMLDivElement>) => void) | undefined,
        handleSelect
      )}
      onFocus={() => setFocused(true)}
      onKeyDown={composeEventHandlers(
        onKeyDown as
          | ((e: React.KeyboardEvent<HTMLDivElement>) => void)
          | undefined,
        (event) => {
          if (disabled || event.target !== event.currentTarget) {
            return;
          }
          const isTypingAhead = ctx.searchRef.current !== "";
          if (isTypingAhead && event.key === " ") {
            return;
          }
          if (SELECTION_KEYS.includes(event.key)) {
            event.currentTarget.click();
            event.preventDefault();
          }
        }
      )}
      onPointerDown={(event) => {
        (
          onPointerDown as
            | ((e: React.PointerEvent<HTMLDivElement>) => void)
            | undefined
        )?.(event);
        isPointerDownRef.current = true;
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        if (disabled) {
          return;
        }
        if (!event.defaultPrevented) {
          (event.currentTarget as HTMLElement).focus({ preventScroll: true });
        }
      }}
      onPointerUp={composeEventHandlers(
        onPointerUp as
          | ((e: React.PointerEvent<HTMLDivElement>) => void)
          | undefined,
        (event) => {
          if (!isPointerDownRef.current) {
            (event.currentTarget as HTMLElement).click();
          }
        }
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-orientation="horizontal"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      role="separator"
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}
interface DropdownMenuSubContextValue {
  content: HTMLElement | null;
  contentId: string;
  onContentChange: (el: HTMLElement | null) => void;
  onOpenChange: (open: boolean) => void;
  onTriggerChange: (el: HTMLElement | null) => void;
  open: boolean;
  trigger: HTMLElement | null;
  triggerId: string;
}

const DropdownMenuSubContext =
  React.createContext<DropdownMenuSubContextValue | null>(null);

function useDropdownMenuSubContext(
  component: string
): DropdownMenuSubContextValue {
  const ctx = React.useContext(DropdownMenuSubContext);
  if (!ctx) {
    throw new Error(`${component} must be used within DropdownMenuSub`);
  }
  return ctx;
}

export interface DropdownMenuSubProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function DropdownMenuSub({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
}: DropdownMenuSubProps) {
  const parentCtx = useDropdownMenuContext("DropdownMenuSub");
  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    prop: openProp,
  });
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null);
  const [content, setContent] = React.useState<HTMLElement | null>(null);
  const contentId = React.useId();
  const triggerId = React.useId();

  React.useEffect(() => {
    if (parentCtx.open === false) {
      setOpen(false);
    }
    return () => setOpen(false);
  }, [parentCtx.open, setOpen]);

  const value = React.useMemo<DropdownMenuSubContextValue>(
    () => ({
      content,
      contentId,
      onContentChange: setContent,
      onOpenChange: setOpen,
      onTriggerChange: setTrigger,
      open,
      trigger,
      triggerId,
    }),
    [contentId, triggerId, trigger, open, setOpen, content]
  );

  return (
    <DropdownMenuSubContext.Provider value={value}>
      {children}
    </DropdownMenuSubContext.Provider>
  );
}

export interface DropdownMenuSubTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  inset?: boolean;
  textValue?: string;
}

function DropdownMenuSubTrigger({
  children,
  className,
  disabled = false,
  inset,
  onClick,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  ...props
}: DropdownMenuSubTriggerProps) {
  const ctx = useDropdownMenuContext("DropdownMenuSubTrigger");
  const sub = useDropdownMenuSubContext("DropdownMenuSubTrigger");
  const openTimerRef = React.useRef<number | null>(null);

  const clearOpenTimer = React.useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
    }
    openTimerRef.current = null;
  }, []);

  React.useEffect(() => clearOpenTimer, [clearOpenTimer]);

  return (
    <div
      aria-controls={sub.open ? sub.contentId : undefined}
      aria-expanded={sub.open}
      aria-haspopup="menu"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className
      )}
      data-disabled={disabled ? "" : undefined}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      data-state={getOpenState(sub.open)}
      id={sub.triggerId}
      ref={(node) => sub.onTriggerChange(node)}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (disabled || event.defaultPrevented) {
          return;
        }
        (event.currentTarget as HTMLElement).focus();
        if (!sub.open) {
          sub.onOpenChange(true);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (disabled || event.target !== event.currentTarget) {
          return;
        }
        const isTypingAhead = ctx.searchRef.current !== "";
        if (isTypingAhead && event.key === " ") {
          return;
        }
        if (SUB_OPEN_KEYS.includes(event.key)) {
          sub.onOpenChange(true);
          sub.content?.focus();
          event.preventDefault();
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        clearOpenTimer();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (event.pointerType !== "mouse") {
          return;
        }
        if (disabled || sub.open || openTimerRef.current) {
          return;
        }
        openTimerRef.current = window.setTimeout(() => {
          sub.onOpenChange(true);
          clearOpenTimer();
        }, 100);
      }}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuSubContentProps
  extends React.ComponentProps<"div"> {
  align?: "start" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  sideOffset?: number;
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = 0,
  avoidCollisions = true,
  className,
  sideOffset = 4,
  onKeyDown,
  ...props
}: DropdownMenuSubContentProps) {
  const sub = useDropdownMenuSubContext("DropdownMenuSubContent");
  const { refs, floatingStyles, isPositioned } = useFloating({
    elements: { reference: sub.trigger },
    middleware: [
      offset({ alignmentAxis: alignOffset, mainAxis: sideOffset }),
      avoidCollisions && shift({ padding: 0 }),
      avoidCollisions && flip(),
    ],
    placement: `right-${align}` as never,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  React.useEffect(() => {
    if (sub.open && sub.trigger) {
      refs.setReference(sub.trigger);
    }
  }, [sub.open, refs, sub.trigger]);

  if (!sub.open) {
    return null;
  }

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
        aria-labelledby={sub.triggerId}
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg outline-none",
          className
        )}
        data-slot="dropdown-menu-sub-content"
        data-state={getOpenState(sub.open)}
        id={sub.contentId}
        ref={sub.onContentChange}
        role="menu"
        tabIndex={-1}
        {...props}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          const isKeyDownInside = event.currentTarget.contains(
            event.target as HTMLElement
          );
          const isCloseKey = SUB_CLOSE_KEYS.includes(event.key);
          if (isKeyDownInside && isCloseKey) {
            sub.onOpenChange(false);
            sub.trigger?.focus();
            event.preventDefault();
          }
        }}
      />
    </div>
  );

  return createPortal(node, document.body);
}

export interface DropdownMenuCheckboxItemProps
  extends Omit<DropdownMenuItemProps, "variant"> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
}

function DropdownMenuCheckboxItem({
  checked = false,
  onCheckedChange,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const isIndeterminate = checked === "indeterminate";
  return (
    <DropdownMenuItem
      {...props}
      aria-checked={isIndeterminate ? "mixed" : checked}
      data-state={
        isIndeterminate ? "indeterminate" : checked ? "checked" : "unchecked"
      }
      onSelect={composeEventHandlers(
        props.onSelect as ((event: Event) => void) | undefined,
        () => {
          onCheckedChange?.(isIndeterminate ? true : !checked);
        }
      )}
      role="menuitemcheckbox"
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked === true && (
          <span className="bg-foreground block size-2 rounded-sm" />
        )}
        {isIndeterminate && (
          <span className="bg-foreground block h-0.5 w-2 rounded-sm" />
        )}
      </span>
      {children as React.ReactNode}
    </DropdownMenuItem>
  );
}

interface DropdownMenuRadioGroupContextValue {
  onValueChange: (value: string) => void;
  value: string | undefined;
}

const DropdownMenuRadioGroupContext =
  React.createContext<DropdownMenuRadioGroupContextValue | null>(null);

function useDropdownMenuRadioGroupContext(
  component: string
): DropdownMenuRadioGroupContextValue {
  const ctx = React.useContext(DropdownMenuRadioGroupContext);
  if (!ctx) {
    throw new Error(`${component} must be used within DropdownMenuRadioGroup`);
  }
  return ctx;
}

export interface DropdownMenuRadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onValueChange?: (value: string) => void;
  value?: string;
}

function DropdownMenuRadioGroup({
  children,
  className,
  value,
  onValueChange,
  ...props
}: DropdownMenuRadioGroupProps) {
  const onValueChangeRef = React.useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const ctx = React.useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({
      onValueChange: (v) => onValueChangeRef.current?.(v),
      value,
    }),
    [value]
  );
  return (
    <DropdownMenuRadioGroupContext.Provider value={ctx}>
      <DropdownMenuGroup className={className} {...props}>
        {children}
      </DropdownMenuGroup>
    </DropdownMenuRadioGroupContext.Provider>
  );
}

export interface DropdownMenuRadioItemProps
  extends Omit<DropdownMenuItemProps, "variant"> {
  value: string;
}

function DropdownMenuRadioItem({
  children,
  value,
  ...props
}: DropdownMenuRadioItemProps) {
  const group = useDropdownMenuRadioGroupContext("DropdownMenuRadioItem");
  const checked = value === group.value;
  return (
    <DropdownMenuItem
      {...props}
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onSelect={composeEventHandlers(
        props.onSelect as ((event: Event) => void) | undefined,
        () => group.onValueChange(value)
      )}
      role="menuitemradio"
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && (
          <span className="bg-foreground block size-2 rounded-full" />
        )}
      </span>
      {children as React.ReactNode}
    </DropdownMenuItem>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
