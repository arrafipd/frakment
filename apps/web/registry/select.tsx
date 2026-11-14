"use client";

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from "@floating-ui/react-dom";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { getTransition, parseMotion, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const defaultSelectMotion = "150 cubic-bezier(0.16, 1, 0.3, 1)";

const contentMargin = 10;
const openKeys = [" ", "Enter", "ArrowUp", "ArrowDown"];
const selectionKeys = [" ", "Enter"];

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

function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined
): T {
  const ref = React.useRef(callback);
  React.useEffect(() => {
    ref.current = callback;
  });
  return React.useCallback(((...args) => ref.current?.(...args)) as T, []);
}

function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  prop: T | undefined;
  defaultProp: T;
  onChange?: ((value: T) => void) | undefined;
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

const visuallyHiddenStyles: React.CSSProperties = {
  border: 0,
  clip: "rect(0, 0, 0, 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
  wordWrap: "normal",
};

function useTypeaheadSearch(onSearchChange: (search: string) => void) {
  const handleSearchChange = useCallbackRef(onSearchChange);
  const searchRef = React.useRef("");
  const timerRef = React.useRef(0);

  const handleTypeaheadSearch = React.useCallback(
    (key: string) => {
      const search = searchRef.current + key;
      handleSearchChange(search);
      const updateSearch = (value: string) => {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") {
          timerRef.current = window.setTimeout(() => updateSearch(""), 1000);
        }
      };
      updateSearch(search);
    },
    [handleSearchChange]
  );

  const resetTypeahead = React.useCallback(() => {
    searchRef.current = "";
    window.clearTimeout(timerRef.current);
  }, []);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return [searchRef, handleTypeaheadSearch, resetTypeahead] as const;
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, i) => array[(startIndex + i) % array.length] as T);
}

function findNextItem<T extends { textValue: string }>(
  items: T[],
  search: string,
  currentItem?: T
) {
  const isRepeated =
    search.length > 1 && Array.from(search).every((c) => c === search[0]);
  const normalizedSearch = isRepeated ? (search[0] as string) : search;
  const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1;
  let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0));
  if (normalizedSearch.length === 1) {
    wrappedItems = wrappedItems.filter((v) => v !== currentItem);
  }
  const nextItem = wrappedItems.find((item) =>
    item.textValue.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextItem === currentItem ? undefined : nextItem;
}

function shouldShowPlaceholder(value?: string) {
  return value === "" || value === undefined;
}

function getOpenState(open: boolean) {
  return open ? "open" : "closed";
}

interface SelectContextValue {
  autoComplete: string | undefined;
  contentId: string;
  disabled: boolean;
  form: string | undefined;
  isFormControl: boolean;
  name: string | undefined;
  nativeOptions: Set<React.ReactElement<React.ComponentProps<"option">>>;
  nativeSelectKey: string;
  onNativeOptionAdd: (
    option: React.ReactElement<React.ComponentProps<"option">>
  ) => void;
  onNativeOptionRemove: (
    option: React.ReactElement<React.ComponentProps<"option">>
  ) => void;
  onOpenChange: (open: boolean) => void;
  onTriggerChange: (node: HTMLButtonElement | null) => void;
  onValueChange: (value: string) => void;
  onValueNodeChange: (node: HTMLSpanElement | null) => void;
  onValueNodeHasChildrenChange: (hasChildren: boolean) => void;
  open: boolean;
  required: boolean;
  trigger: HTMLButtonElement | null;
  triggerPointerDownPosRef: React.MutableRefObject<{
    x: number;
    y: number;
  } | null>;
  value: string | undefined;
  valueNode: HTMLSpanElement | null;
  valueNodeHasChildren: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string): SelectContextValue {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Select`);
  }
  return ctx;
}

interface ItemData {
  disabled: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  textValue: string;
  value: string;
}

const ItemsContext = React.createContext<{
  registerItem: (value: string, data: ItemData) => void;
  unregisterItem: (value: string) => void;
  getItems: () => ItemData[];
} | null>(null);

function useItemsContext(component: string) {
  const ctx = React.useContext(ItemsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Select`);
  }
  return ctx;
}

export interface SelectProps {
  autoComplete?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  form?: string;
  name?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
  open?: boolean;
  required?: boolean;
  value?: string;
}

function Select({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  required = false,
  name,
  form,
  autoComplete,
}: SelectProps) {
  const [trigger, setTrigger] = React.useState<HTMLButtonElement | null>(null);
  const [valueNode, setValueNode] = React.useState<HTMLSpanElement | null>(
    null
  );
  const [valueNodeHasChildren, setValueNodeHasChildren] = React.useState(false);
  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    prop: openProp,
  });
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue
  );
  const value = valueProp === undefined ? internalValue : valueProp;
  const triggerPointerDownPosRef = React.useRef<{
    x: number;
    y: number;
  } | null>(null);
  const [nativeOptionsSet, setNativeOptionsSet] = React.useState<
    Set<React.ReactElement<React.ComponentProps<"option">>>
  >(new Set());
  const itemsMap = React.useRef(new Map<string, ItemData>());
  const contentId = React.useId();

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [valueProp, onValueChange]
  );

  const initialValueRef = React.useRef(value);
  React.useEffect(() => {
    const associatedForm = form
      ? trigger?.ownerDocument.getElementById(form)
      : trigger?.form;
    if (associatedForm instanceof HTMLFormElement) {
      const reset = () => setInternalValue(initialValueRef.current);
      associatedForm.addEventListener("reset", reset);
      return () => associatedForm.removeEventListener("reset", reset);
    }
  }, [form, trigger]);

  const isFormControl = trigger ? !!form || !!trigger.closest("form") : true;
  const nativeSelectKey = Array.from(nativeOptionsSet)
    .map((option) => option.props.value)
    .join(";");

  const onNativeOptionAdd = React.useCallback(
    (option: React.ReactElement<React.ComponentProps<"option">>) => {
      setNativeOptionsSet((prev) => {
        if (prev.has(option)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(option);
        return next;
      });
    },
    []
  );

  const onNativeOptionRemove = React.useCallback(
    (option: React.ReactElement<React.ComponentProps<"option">>) => {
      setNativeOptionsSet((prev) => {
        if (!prev.has(option)) {
          return prev;
        }
        const next = new Set(prev);
        next.delete(option);
        return next;
      });
    },
    []
  );

  const itemsApi = React.useMemo(
    () => ({
      getItems: () => Array.from(itemsMap.current.values()),
      registerItem: (v: string, data: ItemData) => {
        itemsMap.current.set(v, data);
      },
      unregisterItem: (v: string) => {
        itemsMap.current.delete(v);
      },
    }),
    []
  );

  const ctx = React.useMemo<SelectContextValue>(
    () => ({
      autoComplete,
      contentId,
      disabled,
      form,
      isFormControl,
      name,
      nativeOptions: nativeOptionsSet,
      nativeSelectKey,
      onNativeOptionAdd,
      onNativeOptionRemove,
      onOpenChange: setOpen,
      onTriggerChange: setTrigger,
      onValueChange: handleValueChange,
      onValueNodeChange: setValueNode,
      onValueNodeHasChildrenChange: setValueNodeHasChildren,
      open,
      required,
      trigger,
      triggerPointerDownPosRef,
      value,
      valueNode,
      valueNodeHasChildren,
    }),
    [
      trigger,
      valueNode,
      valueNodeHasChildren,
      contentId,
      value,
      handleValueChange,
      open,
      setOpen,
      disabled,
      required,
      name,
      form,
      autoComplete,
      nativeOptionsSet,
      nativeSelectKey,
      onNativeOptionAdd,
      onNativeOptionRemove,
      isFormControl,
    ]
  );

  return (
    <SelectContext.Provider value={ctx}>
      <ItemsContext.Provider value={itemsApi}>
        {children}
        {isFormControl ? <SelectBubbleInput /> : null}
      </ItemsContext.Provider>
    </SelectContext.Provider>
  );
}

function SelectBubbleInput() {
  const ctx = useSelectContext("SelectBubbleInput");
  const ref = React.useRef<HTMLSelectElement>(null);
  const selectValue = ctx.value ?? "";
  const prevValueRef = React.useRef(selectValue);

  const hasEmptyValueOption = Array.from(ctx.nativeOptions).some(
    (option) => (option.props.value ?? "") === ""
  );

  React.useEffect(() => {
    const select = ref.current;
    if (!select) {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      "value"
    ) as PropertyDescriptor;
    const setValue = descriptor.set;
    const valueChanged = prevValueRef.current !== selectValue;
    prevValueRef.current = selectValue;
    if (valueChanged && setValue) {
      const event = new Event("change", { bubbles: true });
      setValue.call(select, selectValue);
      select.dispatchEvent(event);
    }
  }, [selectValue]);

  return (
    <select
      aria-hidden
      autoComplete={ctx.autoComplete}
      defaultValue={selectValue}
      disabled={ctx.disabled}
      form={ctx.form}
      key={ctx.nativeSelectKey}
      name={ctx.name}
      onChange={(event) => ctx.onValueChange(event.target.value)}
      ref={ref}
      required={ctx.required}
      style={{ ...visuallyHiddenStyles }}
      tabIndex={-1}
    >
      {shouldShowPlaceholder(ctx.value) && !hasEmptyValueOption ? (
        <option value="" />
      ) : null}
      {Array.from(ctx.nativeOptions)}
    </select>
  );
}

export type SelectTriggerProps = Omit<React.ComponentProps<"button">, "ref"> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLButtonElement>;
  size?: "sm" | "default";
} & Record<string, unknown>;

function SelectTrigger({
  as,
  className,
  disabled: disabledProp = false,
  onClick,
  onKeyDown,
  onPointerDown,
  ref,
  size = "default",
  ...props
}: SelectTriggerProps) {
  const context = useSelectContext("SelectTrigger");
  const itemsApi = useItemsContext("SelectTrigger");
  const isDisabled = context.disabled || disabledProp;
  const pointerTypeRef =
    React.useRef<React.PointerEvent["pointerType"]>("touch");
  const composedRefs = useComposedRefs(
    ref as React.Ref<HTMLButtonElement> | undefined,
    context.onTriggerChange as (node: HTMLButtonElement | null) => void
  );

  const [searchRef, handleTypeaheadSearch, resetTypeahead] = useTypeaheadSearch(
    (search) => {
      const enabledItems = itemsApi.getItems().filter((item) => !item.disabled);
      const currentItem = enabledItems.find(
        (item) => item.value === context.value
      );
      const nextItem = findNextItem(enabledItems, search, currentItem);
      if (nextItem !== undefined) {
        context.onValueChange(nextItem.value);
      }
    }
  );

  const handleOpen = (pointerEvent?: React.MouseEvent | React.PointerEvent) => {
    if (!isDisabled) {
      context.onOpenChange(true);
      resetTypeahead();
    }
    if (pointerEvent) {
      context.triggerPointerDownPosRef.current = {
        x: Math.round(pointerEvent.pageX),
        y: Math.round(pointerEvent.pageY),
      };
    }
  };

  const Component = as ?? "button";
  const triggerClassName = cn(
    "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex w-fit items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-9 data-[size=sm]:h-8 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  const finalProps: Record<string, unknown> = {
    ...props,
    "aria-autocomplete": "none",
    "aria-controls": context.open ? context.contentId : undefined,
    "aria-expanded": context.open,
    "aria-haspopup": "listbox",
    "aria-required": context.required,
    className: triggerClassName,
    "data-disabled": isDisabled ? "" : undefined,
    "data-placeholder": shouldShowPlaceholder(context.value) ? "" : undefined,
    "data-size": size,
    "data-slot": "select-trigger",
    "data-state": getOpenState(context.open),
    disabled: isDisabled,
    onClick: composeEventHandlers(
      onClick as
        | ((event: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined,
      (event) => {
        event.currentTarget.focus();
        if (pointerTypeRef.current !== "mouse") {
          handleOpen(event);
        }
      }
    ),
    onKeyDown: composeEventHandlers(
      onKeyDown as
        | ((event: React.KeyboardEvent<HTMLButtonElement>) => void)
        | undefined,
      (event) => {
        const isTypingAhead = searchRef.current !== "";
        const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
        if (!isModifierKey && event.key.length === 1) {
          handleTypeaheadSearch(event.key);
        }
        if (isTypingAhead && event.key === " ") {
          return;
        }
        if (openKeys.includes(event.key)) {
          handleOpen();
          event.preventDefault();
        }
      }
    ),
    onPointerDown: composeEventHandlers(
      onPointerDown as
        | ((event: React.PointerEvent<HTMLButtonElement>) => void)
        | undefined,
      (event) => {
        pointerTypeRef.current = event.pointerType;
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }
        if (
          event.button === 0 &&
          event.ctrlKey === false &&
          event.pointerType === "mouse"
        ) {
          handleOpen(event);
          event.preventDefault();
        }
      }
    ),
    ref: composedRefs,
    role: "combobox",
  };
  if (!(as || "type" in props)) {
    finalProps.type = "button";
  }

  const renderedChildren = (
    <>
      {props.children as React.ReactNode}
      <span
        aria-hidden
        className="text-muted-foreground pointer-events-none flex size-4 shrink-0 items-center justify-center"
      >
        <ChevronDownIcon className="size-4" />
      </span>
    </>
  );
  return React.createElement(Component, finalProps, renderedChildren);
}

export type SelectValueProps = Omit<
  React.ComponentProps<"span">,
  "ref" | "placeholder"
> & {
  placeholder?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
};

function SelectValue({
  className,
  style,
  children,
  placeholder = "",
  ref,
  ...props
}: SelectValueProps) {
  const context = useSelectContext("SelectValue");
  const hasChildren = children !== undefined;
  const composedRefs = useComposedRefs(
    ref as React.Ref<HTMLSpanElement> | undefined,
    context.onValueNodeChange as (node: HTMLSpanElement | null) => void
  );

  React.useLayoutEffect(() => {
    context.onValueNodeHasChildrenChange(hasChildren);
  }, [context, hasChildren]);

  const showPlaceholder = shouldShowPlaceholder(context.value);

  return (
    <span
      {...props}
      className={cn(className)}
      data-slot="select-value"
      ref={composedRefs}
      style={{ pointerEvents: "none", ...style }}
    >
      <React.Fragment key={showPlaceholder ? "placeholder" : "value"}>
        {showPlaceholder ? placeholder : children}
      </React.Fragment>
    </span>
  );
}

export interface SelectIconProps extends React.ComponentProps<"span"> {}

function SelectIcon({ children, className, ...props }: SelectIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "text-muted-foreground pointer-events-none flex size-4 shrink-0 items-center justify-center",
        className
      )}
      {...props}
    >
      {children || <ChevronDownIcon className="size-4" />}
    </span>
  );
}

export interface SelectPortalProps {
  children?: React.ReactNode;
}

function SelectPortal({ children }: SelectPortalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return createPortal(children, document.body);
}

interface SelectContentContextValue {
  content: HTMLDivElement | null;
  focusSelectedItem: () => void;
  isPositioned: boolean;
  itemRefCallback: (
    node: HTMLDivElement | null,
    value: string,
    disabled: boolean
  ) => void;
  itemTextRefCallback: (
    node: HTMLSpanElement | null,
    value: string,
    disabled: boolean
  ) => void;
  onItemLeave: () => void;
  onViewportChange: (node: HTMLDivElement | null) => void;
  position: "item-aligned" | "popper";
  searchRef: React.RefObject<string>;
  selectedItem: HTMLDivElement | null;
  selectedItemText: HTMLSpanElement | null;
  viewport: HTMLDivElement | null;
}

const SelectContentContext =
  React.createContext<SelectContentContextValue | null>(null);

const noopContentContext: SelectContentContextValue = {
  content: null,
  focusSelectedItem: () => undefined,
  isPositioned: false,
  itemRefCallback: () => undefined,
  itemTextRefCallback: () => undefined,
  onItemLeave: () => undefined,
  onViewportChange: () => undefined,
  position: "popper",
  searchRef: { current: "" },
  selectedItem: null,
  selectedItemText: null,
  viewport: null,
};

function useSelectContentContext(
  _component: string
): SelectContentContextValue {
  const ctx = React.useContext(SelectContentContext);
  return ctx ?? noopContentContext;
}

const defaultContentClassName =
  "bg-popover text-popover-foreground ring-foreground/10 relative z-50 max-h-(--frakment-select-content-available-height) min-w-(--frakment-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-lg shadow-md ring-1";

const defaultViewportClassName =
  "p-1 data-[position=popper]:w-full data-[position=popper]:min-w-(--frakment-select-trigger-width)";

export type SelectContentProps = React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  motion?: string;

  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: Event) => void;
  position?: "item-aligned" | "popper";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

function SelectContent(props: SelectContentProps) {
  const context = useSelectContext("SelectContent");
  const [fragment, setFragment] = React.useState<DocumentFragment>();

  React.useLayoutEffect(() => {
    setFragment(new DocumentFragment());
  }, []);

  if (context.open) {
    return (
      <SelectPortal>
        <SelectContentImpl {...props} />
      </SelectPortal>
    );
  }
  return <SelectContentFragment {...props} fragment={fragment} />;
}

function SelectContentFragment(
  props: SelectContentProps & { fragment?: DocumentFragment }
) {
  const { fragment, children } = props;
  if (!fragment) {
    return null;
  }
  return createPortal(
    <SelectContentContext.Provider value={noopContentContext}>
      <div>{children}</div>
    </SelectContentContext.Provider>,
    fragment
  );
}

function SelectContentImpl({
  align = "start",
  alignOffset = 0,
  avoidCollisions = true,
  children,
  className,
  collisionPadding = contentMargin,
  motion,
  onEscapeKeyDown,
  onPointerDownOutside,
  position = "item-aligned",
  side = "bottom",
  sideOffset = 4,
  style,
  onKeyDown,
  ...props
}: SelectContentProps) {
  const context = useSelectContext("SelectContentImpl");
  const itemsApi = useItemsContext("SelectContentImpl");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<HTMLDivElement | null>(
    null
  );
  const [selectedItemText, setSelectedItemText] =
    React.useState<HTMLSpanElement | null>(null);
  const [isPositioned, setIsPositioned] = React.useState(false);
  const firstValidItemFoundRef = React.useRef(false);

  const [entered, setEntered] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!isPositioned) {
      return;
    }
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [isPositioned]);

  const reduce = useReducedMotion();
  const motionValue = motion ?? defaultSelectMotion;
  const motionTransition =
    reduce || motion === "off"
      ? "none"
      : getTransition(parseMotion(motionValue));
  const originBySide: Record<string, string> = {
    bottom: "top center",
    left: "center right",
    right: "center left",
    top: "bottom center",
  };
  const transformOrigin = originBySide[side] ?? "center";

  React.useEffect(() => {
    const content = contentRef.current;
    if (!(content && viewport)) {
      return;
    }
    const prevent = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && viewport.contains(target)) {
        return;
      }
      if (event.cancelable) {
        event.preventDefault();
      }
    };
    document.addEventListener("wheel", prevent, { passive: false });
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      document.removeEventListener("wheel", prevent);
      document.removeEventListener("touchmove", prevent);
    };
  }, [viewport]);

  const [searchRef, handleTypeaheadSearch] = useTypeaheadSearch((search) => {
    const enabledItems = itemsApi.getItems().filter((item) => !item.disabled);
    const currentItem = enabledItems.find(
      (item) => item.ref.current === document.activeElement
    );
    const nextItem = findNextItem(enabledItems, search, currentItem);
    if (nextItem) {
      setTimeout(() => nextItem.ref.current?.focus());
    }
  });

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const selector =
      '[tabindex]:not([tabindex="-1"]), button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])';
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }
      const focusables = Array.from(
        content.querySelectorAll<HTMLElement>(selector)
      );
      const first = focusables[0];
      const last = focusables.at(-1);
      if (!(first && last)) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    content.addEventListener("keydown", handler);
    return () => content.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const ownerDocument = content.ownerDocument;
    const pointerdown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!(content.contains(target) || context.trigger?.contains(target))) {
        context.onOpenChange(false);
        onPointerDownOutside?.(event as unknown as Event);
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) {
        event.preventDefault();
        context.onOpenChange(false);
      }
    };
    ownerDocument.addEventListener("pointerdown", pointerdown);
    ownerDocument.addEventListener("keydown", keydown, { capture: true });
    return () => {
      ownerDocument.removeEventListener("pointerdown", pointerdown);
      ownerDocument.removeEventListener("keydown", keydown, { capture: true });
    };
  }, [context, onPointerDownOutside, onEscapeKeyDown]);

  React.useEffect(
    () => () => {
      context.trigger?.focus({ preventScroll: true });
    },
    [context]
  );

  const focusFirst = React.useCallback(
    (candidates: Array<HTMLElement | null>) => {
      const allItems = itemsApi.getItems().map((item) => item.ref.current);
      const [firstItem, ...restItems] = allItems;
      const [lastItem] = restItems.slice(-1);
      const PREV = document.activeElement;
      for (const candidate of candidates) {
        if (candidate === PREV) {
          return;
        }
        candidate?.scrollIntoView({ block: "nearest" });
        if (candidate === firstItem && viewport) {
          viewport.scrollTop = 0;
        }
        if (candidate === lastItem && viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
        candidate?.focus();
        if (document.activeElement !== PREV) {
          return;
        }
      }
    },
    [itemsApi, viewport]
  );

  const focusSelectedItem = React.useCallback(
    () => focusFirst([selectedItem, contentRef.current]),
    [focusFirst, selectedItem]
  );

  React.useEffect(() => {
    if (!context.open) {
      return;
    }
    const handle = requestAnimationFrame(() => {
      const el = contentRef.current;
      if (el && !el.contains(document.activeElement)) {
        el.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [context.open]);

  React.useEffect(() => {
    if (isPositioned) {
      focusSelectedItem();
    }
  }, [isPositioned, focusSelectedItem]);

  const firstItemFoundRef = React.useRef(false);
  const firstItemTextFoundRef = React.useRef(false);

  const itemRefCallback = React.useCallback(
    (node: HTMLDivElement | null, value: string, disabled: boolean) => {
      const isFirstItem = !firstItemFoundRef.current;
      if (isFirstItem) {
        firstItemFoundRef.current = true;
      }
      const isFirstValid = !(firstValidItemFoundRef.current || disabled);
      const isSelected = context.value !== undefined && context.value === value;
      if (isSelected || isFirstValid) {
        setSelectedItem(node);
        if (isFirstValid) {
          firstValidItemFoundRef.current = true;
        }
      } else if (isFirstItem) {
        setSelectedItem(node);
      }
    },
    [context.value]
  );

  const itemTextRefCallback = React.useCallback(
    (node: HTMLSpanElement | null, value: string, disabled: boolean) => {
      if (!node) {
        return;
      }
      const isFirstItem = !firstItemTextFoundRef.current;
      if (isFirstItem) {
        firstItemTextFoundRef.current = true;
      }
      const isFirstValid = !(firstValidItemFoundRef.current || disabled);
      const isSelected = context.value !== undefined && context.value === value;
      if (isSelected || isFirstValid) {
        setSelectedItemText(node);
      } else if (isFirstItem) {
        setSelectedItemText(node);
      }
    },
    [context.value]
  );

  const handleItemLeave = React.useCallback(
    () => contentRef.current?.focus(),
    []
  );

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
    if (event.key === "Tab") {
      event.preventDefault();
    }
    if (!isModifierKey && event.key.length === 1) {
      handleTypeaheadSearch(event.key);
    }
    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      const items = itemsApi.getItems().filter((item) => !item.disabled);
      let candidates = items
        .map((item) => item.ref.current)
        .filter((n): n is HTMLDivElement => n !== null);
      if (["ArrowUp", "End"].includes(event.key)) {
        candidates = candidates.slice().reverse();
      }
      if (["ArrowUp", "ArrowDown"].includes(event.key)) {
        const currentIndex = candidates.indexOf(event.target as HTMLDivElement);
        candidates = candidates.slice(currentIndex + 1);
      }
      setTimeout(() => focusFirst(candidates));
      event.preventDefault();
    }
  };

  const contentContext: SelectContentContextValue = {
    content: contentEl,
    focusSelectedItem,
    isPositioned,
    itemRefCallback,
    itemTextRefCallback,
    onItemLeave: handleItemLeave,
    onViewportChange: setViewport,
    position,
    searchRef,
    selectedItem,
    selectedItemText,
    viewport,
  };

  const contentClassName = cn(
    defaultContentClassName,
    position === "popper" &&
      "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
    className
  );

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    opacity: entered ? 1 : 0,
    outline: "none",
    transform: entered ? "scale(1)" : "scale(0.95)",
    transformOrigin,
    transition: motionTransition ?? "none",
    ...style,
  };

  const contentProps = {
    ...props,
    "aria-labelledby": context.trigger?.id,
    className: contentClassName,
    "data-slot": "select-content",
    "data-state": getOpenState(context.open),
    id: context.contentId,
    onContextMenu: (event: React.MouseEvent<HTMLDivElement>) =>
      event.preventDefault(),
    onKeyDown: handleContentKeyDown,
    role: "listbox" as const,
    style: contentStyle,
    tabIndex: -1,
  };

  return (
    <SelectContentContext.Provider value={contentContext}>
      {position === "popper" ? (
        <SelectPopperPosition
          align={align}
          alignOffset={alignOffset}
          avoidCollisions={avoidCollisions}
          collisionPadding={collisionPadding}
          contentProps={contentProps}
          contentRef={contentRef}
          contentSetRef={setContentEl}
          onPlaced={() => setIsPositioned(true)}
          side={side}
          sideOffset={sideOffset}
        >
          <SelectViewport>{children}</SelectViewport>
        </SelectPopperPosition>
      ) : (
        <SelectItemAlignedPosition
          contentProps={contentProps}
          contentRef={contentRef}
          contentSetRef={setContentEl}
          onPlaced={() => setIsPositioned(true)}
        >
          <SelectViewport>{children}</SelectViewport>
        </SelectItemAlignedPosition>
      )}
    </SelectContentContext.Provider>
  );
}

interface SelectPopperPositionProps {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  children?: React.ReactNode;
  collisionPadding?: number;
  contentProps: Record<string, unknown>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentSetRef: (node: HTMLDivElement | null) => void;
  onPlaced?: () => void;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

function SelectPopperPosition({
  align = "start",
  alignOffset = 0,
  avoidCollisions = true,
  children,
  collisionPadding = contentMargin,
  contentProps,
  contentRef,
  contentSetRef,
  onPlaced,
  side = "bottom",
  sideOffset = 4,
}: SelectPopperPositionProps) {
  const context = useSelectContext("SelectPopperPosition");
  const { refs, floatingStyles, isPositioned, placement } = useFloating({
    elements: { reference: context.trigger },
    middleware: [
      offset({ alignmentAxis: alignOffset, mainAxis: sideOffset }),
      avoidCollisions && shift({ padding: collisionPadding }),
      avoidCollisions && flip({ padding: collisionPadding }),
      sizeMiddleware({
        apply: ({ elements, rects, availableWidth, availableHeight }) => {
          elements.floating.style.setProperty(
            "--frakment-select-content-available-width",
            `${availableWidth}px`
          );
          elements.floating.style.setProperty(
            "--frakment-select-content-available-height",
            `${availableHeight}px`
          );
          elements.floating.style.setProperty(
            "--frakment-select-trigger-width",
            `${rects.reference.width}px`
          );
          elements.floating.style.setProperty(
            "--frakment-select-trigger-height",
            `${rects.reference.height}px`
          );
        },
      }),
    ],
    placement: (side + (align === "center" ? "" : `-${align}`)) as never,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  React.useEffect(() => {
    if (context.open && context.trigger) {
      refs.setReference(context.trigger);
    }
  }, [context.open, refs, context.trigger]);

  React.useEffect(() => {
    if (isPositioned) {
      onPlaced?.();
    }
  }, [isPositioned, onPlaced]);

  const placedSide = placement.split("-")[0];
  const placedAlign = placement.split("-")[1] ?? "center";

  return (
    <div
      data-align={placedAlign}
      data-popper-wrapper=""
      data-side={placedSide}
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
        {...contentProps}
        data-align={placedAlign}
        data-side={placedSide}
        ref={(node) => {
          contentRef.current = node;
          contentSetRef(node);
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface SelectViewportProps extends React.ComponentProps<"div"> {}

interface SelectViewportContextValue {
  contentWrapper: HTMLDivElement | null;
  onScrollButtonChange: ((node: HTMLDivElement | null) => void) | null;
  shouldExpandOnScrollRef: React.RefObject<boolean> | null;
}

const SelectViewportContext =
  React.createContext<SelectViewportContextValue | null>(null);

function useSelectViewportContext(): SelectViewportContextValue {
  const ctx = React.useContext(SelectViewportContext);
  return (
    ctx ?? {
      contentWrapper: null,
      onScrollButtonChange: null,
      shouldExpandOnScrollRef: null,
    }
  );
}

function clamp(value: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(value, min), max);
}

interface SelectItemAlignedPositionProps {
  children?: React.ReactNode;
  contentProps: Record<string, unknown>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentSetRef: (node: HTMLDivElement | null) => void;
  onPlaced?: () => void;
}

function SelectItemAlignedPosition({
  children,
  contentProps,
  contentRef,
  contentSetRef,
  onPlaced,
}: SelectItemAlignedPositionProps) {
  const context = useSelectContext("SelectItemAlignedPosition");
  const contentCtx = useSelectContentContext("SelectItemAlignedPosition");
  const itemsApi = useItemsContext("SelectItemAlignedPosition");
  const [contentWrapper, setContentWrapper] =
    React.useState<HTMLDivElement | null>(null);
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  const [contentZIndex, setContentZIndex] = React.useState<string>();
  const shouldExpandOnScrollRef = React.useRef(false);
  const shouldRepositionRef = React.useRef(true);
  const { viewport, selectedItem, selectedItemText } = contentCtx;

  const position = React.useCallback(() => {
    if (
      !(
        context.trigger &&
        context.valueNode &&
        contentWrapper &&
        content &&
        viewport &&
        selectedItem &&
        selectedItemText
      )
    ) {
      return;
    }

    const triggerRect = context.trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const valueNodeRect = context.valueNode.getBoundingClientRect();
    const itemTextRect = selectedItemText.getBoundingClientRect();

    const itemTextOffset = itemTextRect.left - contentRect.left;
    const left = valueNodeRect.left - itemTextOffset;
    const leftDelta = triggerRect.left - left;
    const minContentWidth = triggerRect.width + leftDelta;
    const contentWidth = Math.max(minContentWidth, contentRect.width);
    const rightEdge = window.innerWidth - contentMargin;
    const clampedLeft = clamp(left, [
      contentMargin,
      Math.max(contentMargin, rightEdge - contentWidth),
    ]);

    contentWrapper.style.minWidth = `${minContentWidth}px`;
    contentWrapper.style.left = `${clampedLeft}px`;

    const items = itemsApi.getItems();
    const availableHeight = window.innerHeight - contentMargin * 2;
    const itemsHeight = viewport.scrollHeight;

    const contentStyles = window.getComputedStyle(content);
    const contentBorderTopWidth = Number.parseInt(
      contentStyles.borderTopWidth,
      10
    );
    const contentPaddingTop = Number.parseInt(contentStyles.paddingTop, 10);
    const contentBorderBottomWidth = Number.parseInt(
      contentStyles.borderBottomWidth,
      10
    );
    const contentPaddingBottom = Number.parseInt(
      contentStyles.paddingBottom,
      10
    );
    const fullContentHeight =
      contentBorderTopWidth +
      contentPaddingTop +
      itemsHeight +
      contentPaddingBottom +
      contentBorderBottomWidth;
    const minContentHeight = Math.min(
      selectedItem.offsetHeight * 5,
      fullContentHeight
    );

    const viewportStyles = window.getComputedStyle(viewport);
    const viewportPaddingTop = Number.parseInt(viewportStyles.paddingTop, 10);
    const viewportPaddingBottom = Number.parseInt(
      viewportStyles.paddingBottom,
      10
    );

    const topEdgeToTriggerMiddle =
      triggerRect.top + triggerRect.height / 2 - contentMargin;
    const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;

    const selectedItemHalfHeight = selectedItem.offsetHeight / 2;
    const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight;
    const contentTopToItemMiddle =
      contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
    const itemMiddleToContentBottom =
      fullContentHeight - contentTopToItemMiddle;

    const willAlignWithoutTopOverflow =
      contentTopToItemMiddle <= topEdgeToTriggerMiddle;

    if (willAlignWithoutTopOverflow) {
      const isLastItem =
        items.length > 0 && selectedItem === items.at(-1)?.ref.current;
      contentWrapper.style.bottom = "0px";
      const viewportOffsetBottom =
        content.clientHeight - viewport.offsetTop - viewport.offsetHeight;
      const clampedTriggerMiddleToBottomEdge = Math.max(
        triggerMiddleToBottomEdge,
        selectedItemHalfHeight +
          (isLastItem ? viewportPaddingBottom : 0) +
          viewportOffsetBottom +
          contentBorderBottomWidth
      );
      const height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge;
      contentWrapper.style.height = `${height}px`;
    } else {
      const isFirstItem =
        items.length > 0 && selectedItem === items[0]?.ref.current;
      contentWrapper.style.top = "0px";
      const clampedTopEdgeToTriggerMiddle = Math.max(
        topEdgeToTriggerMiddle,
        contentBorderTopWidth +
          viewport.offsetTop +
          (isFirstItem ? viewportPaddingTop : 0) +
          selectedItemHalfHeight
      );
      const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
      contentWrapper.style.height = `${height}px`;
      viewport.scrollTop =
        contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop;
    }

    contentWrapper.style.margin = `${contentMargin}px 0`;
    contentWrapper.style.minHeight = `${minContentHeight}px`;
    contentWrapper.style.maxHeight = `${availableHeight}px`;

    onPlaced?.();
    requestAnimationFrame(() => {
      shouldExpandOnScrollRef.current = true;
    });
  }, [
    context.trigger,
    context.valueNode,
    contentWrapper,
    content,
    viewport,
    selectedItem,
    selectedItemText,
    itemsApi,
    onPlaced,
  ]);

  React.useLayoutEffect(() => position(), [position]);

  React.useLayoutEffect(() => {
    if (content) {
      setContentZIndex(window.getComputedStyle(content).zIndex);
    }
  }, [content]);

  const handleScrollButtonChange = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node && shouldRepositionRef.current) {
        position();
        contentCtx.focusSelectedItem();
        shouldRepositionRef.current = false;
      }
    },
    [position, contentCtx]
  );

  return (
    <SelectViewportContext.Provider
      value={{
        contentWrapper,
        onScrollButtonChange: handleScrollButtonChange,
        shouldExpandOnScrollRef,
      }}
    >
      <div
        ref={setContentWrapper}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          zIndex: contentZIndex,
        }}
      >
        <div
          {...contentProps}
          ref={(node) => {
            setContent(node);
            contentRef.current = node;
            contentSetRef(node);
          }}
          style={{
            boxSizing: "border-box",
            maxHeight: "100%",
            ...((contentProps.style as React.CSSProperties) ?? {}),
          }}
        >
          {children}
        </div>
      </div>
    </SelectViewportContext.Provider>
  );
}

function SelectViewport({
  children,
  className,
  onScroll,
  style,
  ref,
  ...props
}: SelectViewportProps & { ref?: React.Ref<HTMLDivElement> }) {
  const contentCtx = useSelectContentContext("SelectViewport");
  const viewportCtx = useSelectViewportContext();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const prevScrollTopRef = React.useRef(0);
  const composedRefs = useComposedRefs(
    ref as React.Ref<HTMLDivElement> | undefined,
    viewportRef,
    (node: HTMLDivElement | null) => contentCtx.onViewportChange(node)
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(event);
    const viewport = event.currentTarget;
    const { contentWrapper, shouldExpandOnScrollRef } = viewportCtx;
    if (shouldExpandOnScrollRef?.current && contentWrapper) {
      const scrolledBy = Math.abs(
        prevScrollTopRef.current - viewport.scrollTop
      );
      if (scrolledBy > 0) {
        const availableHeight = window.innerHeight - contentMargin * 2;
        const cssMinHeight = Number.parseFloat(contentWrapper.style.minHeight);
        const cssHeight = Number.parseFloat(contentWrapper.style.height);
        const prevHeight = Math.max(cssMinHeight, cssHeight);
        if (prevHeight < availableHeight) {
          const nextHeight = prevHeight + scrolledBy;
          const clampedNextHeight = Math.min(availableHeight, nextHeight);
          const heightDiff = nextHeight - clampedNextHeight;
          contentWrapper.style.height = `${clampedNextHeight}px`;
          if (contentWrapper.style.bottom === "0px") {
            viewport.scrollTop = Math.max(heightDiff, 0);
            contentWrapper.style.justifyContent = "flex-end";
          }
        }
      }
    }
    prevScrollTopRef.current = viewport.scrollTop;
  };

  return (
    <div
      className={cn(defaultViewportClassName, className)}
      data-position={contentCtx.position}
      data-slot="select-viewport"
      {...props}
      onScroll={handleScroll}
      ref={composedRefs}
      role="presentation"
      style={{
        flex: 1,
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface SelectGroupContextValue {
  id: string;
}

const SelectGroupContext = React.createContext<SelectGroupContextValue | null>(
  null
);

function useSelectGroupContext(component: string): SelectGroupContextValue {
  const ctx = React.useContext(SelectGroupContext);
  if (!ctx) {
    throw new Error(`${component} must be used within SelectGroup`);
  }
  return ctx;
}

export interface SelectGroupProps extends React.ComponentProps<"div"> {}

function SelectGroup({ className, ...props }: SelectGroupProps) {
  const groupId = React.useId();
  return (
    <SelectGroupContext.Provider value={{ id: groupId }}>
      <div
        aria-labelledby={groupId}
        className={cn("scroll-my-1 p-1", className)}
        data-slot="select-group"
        role="group"
        {...props}
      />
    </SelectGroupContext.Provider>
  );
}

export interface SelectLabelProps extends React.ComponentProps<"div"> {}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  const ctx = useSelectGroupContext("SelectLabel");
  return (
    <div
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      data-slot="select-label"
      id={ctx.id}
      {...props}
    />
  );
}

interface SelectItemContextValue {
  disabled: boolean;
  isSelected: boolean;
  onItemTextChange: (node: HTMLSpanElement | null) => void;
  textId: string;
  value: string;
}

const SelectItemContext = React.createContext<SelectItemContextValue | null>(
  null
);

function useSelectItemContext(component: string): SelectItemContextValue {
  const ctx = React.useContext(SelectItemContext);
  if (!ctx) {
    throw new Error(`${component} must be used within SelectItem`);
  }
  return ctx;
}

export type SelectItemProps = React.ComponentProps<"div"> & {
  value: string;
  disabled?: boolean;
  textValue?: string;
};

function SelectItem({
  children,
  className,
  disabled = false,
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerLeave,
  onPointerMove,
  onPointerUp,
  textValue: textValueProp,
  value,
  ...props
}: SelectItemProps) {
  const context = useSelectContext("SelectItem");
  const contentCtx = useSelectContentContext("SelectItem");
  const itemsApi = useItemsContext("SelectItem");
  const isSelected = context.value === value;
  const [textValue, setTextValue] = React.useState(textValueProp ?? "");
  const [isFocused, setIsFocused] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const textId = React.useId();
  const pointerTypeRef =
    React.useRef<React.PointerEvent["pointerType"]>("touch");

  React.useEffect(() => {
    itemsApi.registerItem(value, {
      disabled,
      ref,
      textValue: textValueProp ?? textValue,
      value,
    });
    return () => itemsApi.unregisterItem(value);
  }, [itemsApi, value, textValueProp, textValue, disabled]);

  React.useEffect(() => {
    if (ref.current) {
      contentCtx.itemRefCallback(ref.current, value, disabled);
    }
  }, [contentCtx, value, disabled]);

  const handleSelect = () => {
    if (disabled) {
      return;
    }
    context.onValueChange(value);
    context.onOpenChange(false);
  };

  return (
    <SelectItemContext.Provider
      value={{
        disabled,
        isSelected,
        onItemTextChange: React.useCallback((node) => {
          setTextValue((prev) => prev || (node?.textContent ?? "").trim());
        }, []),
        textId,
        value,
      }}
    >
      <div
        aria-disabled={disabled || undefined}
        aria-labelledby={textId}
        aria-selected={isSelected && isFocused}
        className={cn(
          "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
          className
        )}
        data-disabled={disabled ? "" : undefined}
        data-highlighted={isFocused ? "" : undefined}
        data-slot="select-item"
        data-state={isSelected ? "checked" : "unchecked"}
        {...props}
        onBlur={(event) => {
          setIsFocused(false);
          props.onBlur?.(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (disabled) {
            return;
          }
          if (pointerTypeRef.current !== "mouse") {
            handleSelect();
          }
        }}
        onFocus={(event) => {
          setIsFocused(true);
          props.onFocus?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (disabled || event.target !== event.currentTarget) {
            return;
          }
          const isTypingAhead = contentCtx.searchRef.current !== "";
          if (isTypingAhead && event.key === " ") {
            return;
          }
          if (selectionKeys.includes(event.key)) {
            handleSelect();
          }
          if (event.key === " ") {
            event.preventDefault();
          }
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          pointerTypeRef.current = event.pointerType;
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.currentTarget === document.activeElement) {
            contentCtx.onItemLeave();
          }
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          pointerTypeRef.current = event.pointerType;
          if (disabled) {
            contentCtx.onItemLeave();
          } else if (pointerTypeRef.current === "mouse") {
            event.currentTarget.focus({ preventScroll: true });
          }
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          if (disabled) {
            return;
          }
          if (pointerTypeRef.current !== "mouse") {
            return;
          }
          const pointerDownPos = context.triggerPointerDownPosRef.current;
          if (pointerDownPos !== null) {
            context.triggerPointerDownPosRef.current = null;
            const dx = Math.abs(Math.round(event.pageX) - pointerDownPos.x);
            const dy = Math.abs(Math.round(event.pageY) - pointerDownPos.y);
            if (dx <= 10 && dy <= 10) {
              return;
            }
          }
          handleSelect();
        }}
        ref={ref}
        role="option"
        tabIndex={disabled ? undefined : -1}
      >
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          <SelectItemIndicator>
            <CheckIcon className="pointer-events-none" />
          </SelectItemIndicator>
        </span>
        <SelectItemText>{children}</SelectItemText>
      </div>
    </SelectItemContext.Provider>
  );
}

export interface SelectItemTextProps extends React.ComponentProps<"span"> {}

function SelectItemText({ children, ...props }: SelectItemTextProps) {
  const context = useSelectContext("SelectItemText");
  const contentCtx = useSelectContentContext("SelectItemText");
  const itemCtx = useSelectItemContext("SelectItemText");
  const [itemTextNode, setItemTextNode] =
    React.useState<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    if (itemTextNode) {
      itemCtx.onItemTextChange(itemTextNode);
      contentCtx.itemTextRefCallback(
        itemTextNode,
        itemCtx.value,
        itemCtx.disabled
      );
    }
  }, [itemTextNode, itemCtx, contentCtx]);

  const textContent = itemTextNode?.textContent;

  const nativeOption = React.useMemo(
    () => (
      <option
        disabled={itemCtx.disabled}
        key={itemCtx.value}
        value={itemCtx.value}
      >
        {textContent}
      </option>
    ),
    [itemCtx.disabled, itemCtx.value, textContent]
  );

  const onNativeOptionAdd = context.onNativeOptionAdd;
  const onNativeOptionRemove = context.onNativeOptionRemove;

  React.useLayoutEffect(() => {
    onNativeOptionAdd(nativeOption);
    return () => onNativeOptionRemove(nativeOption);
  }, [onNativeOptionAdd, onNativeOptionRemove, nativeOption]);

  return (
    <>
      <span id={itemCtx.textId} {...props} ref={setItemTextNode}>
        {children}
      </span>
      {itemCtx.isSelected &&
      context.valueNode &&
      !context.valueNodeHasChildren &&
      !shouldShowPlaceholder(context.value)
        ? createPortal(children, context.valueNode)
        : null}
    </>
  );
}

export interface SelectItemIndicatorProps
  extends React.ComponentProps<"span"> {}

function SelectItemIndicator({ children, ...props }: SelectItemIndicatorProps) {
  const itemCtx = useSelectItemContext("SelectItemIndicator");
  return itemCtx.isSelected ? (
    <span aria-hidden {...props}>
      {children}
    </span>
  ) : null;
}

export interface SelectSeparatorProps extends React.ComponentProps<"div"> {}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <div
      aria-hidden
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

type SelectScrollButtonImplProps = React.ComponentProps<"div"> & {
  onAutoScroll: () => void;
  ref?: React.Ref<HTMLDivElement>;
};

function SelectScrollButtonImpl({
  children,
  onAutoScroll,
  onPointerDown,
  onPointerLeave,
  onPointerMove,
  ref,
  style,
  ...props
}: SelectScrollButtonImplProps) {
  const contentCtx = useSelectContentContext("SelectScrollButtonImpl");
  const itemsApi = useItemsContext("SelectScrollButtonImpl");
  const autoScrollTimerRef = React.useRef<number | null>(null);

  const clearAutoScrollTimer = React.useCallback(() => {
    if (autoScrollTimerRef.current !== null) {
      window.clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => clearAutoScrollTimer, [clearAutoScrollTimer]);

  React.useLayoutEffect(() => {
    const activeItem = itemsApi
      .getItems()
      .find((item) => item.ref.current === document.activeElement);
    activeItem?.ref.current?.scrollIntoView({ block: "nearest" });
  }, [itemsApi]);

  return (
    <div
      aria-hidden
      {...props}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (autoScrollTimerRef.current === null) {
          autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        clearAutoScrollTimer();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        contentCtx.onItemLeave();
        if (autoScrollTimerRef.current === null) {
          autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
        }
      }}
      ref={ref}
      style={{ flexShrink: 0, ...style }}
    >
      {children}
    </div>
  );
}

export interface SelectScrollUpButtonProps
  extends React.ComponentProps<"div"> {}

function SelectScrollUpButton(props: SelectScrollUpButtonProps) {
  const contentCtx = useSelectContentContext("SelectScrollUpButton");
  const viewportCtx = useSelectViewportContext();
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportCtx.onScrollButtonChange?.(node);
    },
    [viewportCtx]
  );

  React.useLayoutEffect(() => {
    const viewport = contentCtx.viewport;
    if (!(viewport && contentCtx.isPositioned)) {
      return;
    }
    const handleScroll = () => setCanScrollUp(viewport.scrollTop > 0);
    handleScroll();
    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [contentCtx.viewport, contentCtx.isPositioned]);

  if (!canScrollUp) {
    return null;
  }

  return (
    <SelectScrollButtonImpl
      {...props}
      onAutoScroll={() => {
        const { viewport, selectedItem } = contentCtx;
        if (viewport && selectedItem) {
          viewport.scrollTop -= selectedItem.offsetHeight;
        }
      }}
      ref={composedRef}
    />
  );
}

export interface SelectScrollDownButtonProps
  extends React.ComponentProps<"div"> {}

function SelectScrollDownButton(props: SelectScrollDownButtonProps) {
  const contentCtx = useSelectContentContext("SelectScrollDownButton");
  const viewportCtx = useSelectViewportContext();
  const [canScrollDown, setCanScrollDown] = React.useState(false);
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportCtx.onScrollButtonChange?.(node);
    },
    [viewportCtx]
  );

  React.useLayoutEffect(() => {
    const viewport = contentCtx.viewport;
    if (!(viewport && contentCtx.isPositioned)) {
      return;
    }
    const handleScroll = () => {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      setCanScrollDown(Math.ceil(viewport.scrollTop) < maxScroll);
    };
    handleScroll();
    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [contentCtx.viewport, contentCtx.isPositioned]);

  if (!canScrollDown) {
    return null;
  }

  return (
    <SelectScrollButtonImpl
      {...props}
      onAutoScroll={() => {
        const { viewport, selectedItem } = contentCtx;
        if (viewport && selectedItem) {
          viewport.scrollTop += selectedItem.offsetHeight;
        }
      }}
      ref={composedRef}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
