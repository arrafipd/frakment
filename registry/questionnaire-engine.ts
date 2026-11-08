"use client";

import * as React from "react";

// ============================================================
// Types
// ============================================================

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";
export type QuestionnaireShortcutMode = "letters" | "numbers";

export interface QuestionnaireChoiceDefinition {
  disabled?: boolean;
  value: string;
}

export interface QuestionnaireItemDefinition {
  choices?: readonly QuestionnaireChoiceDefinition[];
  disabled?: boolean;
  name: string;
  required?: boolean;
}

export interface QuestionnaireRootState {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
}

export interface QuestionnaireItemState {
  active: boolean;
  disabled: boolean;
  invalid: boolean;
  multiple: boolean;
  required: boolean;
  status: QuestionnaireItemStatus;
}

export interface QuestionnaireChoiceState {
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
  shortcut: string | null;
  type: "checkbox" | "radio";
}

export interface QuestionnaireInputState {
  disabled: boolean;
  filled: boolean;
  invalid: boolean;
}

export type QuestionnaireInputType =
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

export interface QuestionnaireNavigationState {
  disabled: boolean;
  shortcut: "Enter" | null;
  status: QuestionnaireItemStatus | null;
  visible: boolean;
}

// ============================================================
// Render helper — resolves asChild / render prop
// ============================================================

type StateMapping<S> = {
  [K in keyof S]?: (value: S[K]) => Record<string, string | undefined>;
};

interface RenderOptions<Tag extends keyof React.JSX.IntrinsicElements, State> {
  defaultTagName: Tag;
  props: React.JSX.IntrinsicElements[Tag] & {
    ref?: React.Ref<unknown>;
    children?: React.ReactNode;
  };
  render?:
    | React.ReactElement
    | ((props: Record<string, unknown>, state: State) => React.ReactNode);
  state: State;
  stateAttributesMapping?: StateMapping<State>;
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (el) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(el);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = el;
      }
    }
  };
}

function applyStateAttrs<S>(
  state: S,
  mapping?: StateMapping<S>
): Record<string, string | undefined> {
  if (!mapping) {
    return {};
  }
  const out: Record<string, string | undefined> = {};
  for (const key of Object.keys(mapping) as (keyof S)[]) {
    const fn = mapping[key];
    if (fn && state[key] !== undefined) {
      Object.assign(out, fn(state[key]));
    }
  }
  return out;
}

function renderElement<Tag extends keyof React.JSX.IntrinsicElements, State>({
  defaultTagName,
  props,
  render,
  state,
  stateAttributesMapping,
}: RenderOptions<Tag, State>): React.ReactElement | null {
  const merged = {
    ...applyStateAttrs(state, stateAttributesMapping),
    ...props,
  } as Record<string, unknown>;
  if (!render) {
    return React.createElement(defaultTagName as string, merged as never);
  }
  if (typeof render === "function") {
    return render(merged, state) as React.ReactElement | null;
  }
  if (!React.isValidElement(render)) {
    return null;
  }
  const rp = render.props as Record<string, unknown>;
  return React.cloneElement(
    render as React.ReactElement,
    {
      ...merged,
      ...rp,
      ref: mergeRefs(
        merged.ref as React.Ref<unknown>,
        rp.ref as React.Ref<unknown>
      ),
    } as never
  );
}

// ============================================================
// Shortcut utilities
// ============================================================

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);
const NUMBERS = Array.from({ length: 9 }, (_, i) => String(i + 1));

function shortcutsFor(mode: QuestionnaireShortcutMode | null): string[] {
  if (mode === "letters") {
    return LETTERS;
  }
  if (mode === "numbers") {
    return NUMBERS;
  }
  return [];
}

function matchShortcut(
  key: string,
  mode: QuestionnaireShortcutMode
): string | null {
  const candidate = mode === "letters" ? key.toUpperCase() : key;
  return shortcutsFor(mode).includes(candidate) ? candidate : null;
}

function formatShortcut(
  shortcut: string | null,
  showEnter: boolean
): string | undefined {
  return (
    [shortcut, showEnter ? "Enter" : null].filter(Boolean).join(" ") ||
    undefined
  );
}

// ============================================================
// Answer / DOM utilities
// ============================================================

interface AnswerControl {
  disabled: boolean;
  element: HTMLElement;
  id: string;
  ownDisabled?: boolean;
  type: "choice" | "input";
  value?: string;
}

function hasValue(v: unknown): boolean {
  if (Array.isArray(v)) {
    return v.some((x) => String(x).trim().length > 0);
  }
  return v !== null && v !== undefined && String(v).trim().length > 0;
}

function isInteractive(el: EventTarget | null): boolean {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    return true;
  }
  if (el instanceof HTMLInputElement) {
    return !["button", "checkbox", "radio", "reset", "submit"].includes(
      el.type
    );
  }
  return el instanceof HTMLElement && el.isContentEditable;
}

function isRadio(el: EventTarget | null): boolean {
  return el instanceof HTMLInputElement && el.type === "radio";
}

function isAnswered(c: AnswerControl): boolean {
  if (c.type === "choice") {
    return (c.element as HTMLInputElement).checked;
  }
  return (
    c.element.hasAttribute("name") &&
    hasValue((c.element as HTMLInputElement).value)
  );
}

function isSkippableInput(c: AnswerControl | null): boolean {
  if (c?.type !== "input") {
    return false;
  }
  const el = c.element as HTMLInputElement;
  return (
    ["email", "password", "search", "tel", "text", "url"].includes(el.type) &&
    !hasValue(el.value)
  );
}

function byDOMOrder(a: AnswerControl, b: AnswerControl): number {
  if (a.element === b.element) {
    return 0;
  }
  const pos = a.element.compareDocumentPosition(b.element);
  if (
    pos === Node.DOCUMENT_POSITION_FOLLOWING ||
    pos ===
      Node.DOCUMENT_POSITION_FOLLOWING + Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1;
  }
  if (
    pos === Node.DOCUMENT_POSITION_PRECEDING ||
    pos === Node.DOCUMENT_POSITION_PRECEDING + Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1;
  }
  return 0;
}

// ============================================================
// Contexts
// ============================================================

interface ItemHandle {
  choices: { value: string; disabled?: boolean }[];
  disabled: boolean;
  element: HTMLElement;
  focus: () => void;
  focusInvalid: () => void;
  getAnswerByElement: (el: Element) => AnswerControl | null;
  getAnswerByShortcut: (s: string) => AnswerControl | null;
  moveAnswerFocus: (el: Element, dir: "next" | "previous") => boolean;
  name: string;
  required: boolean;
  reset: () => void;
  skip: () => void;
  status: QuestionnaireItemStatus;
  validate: () => boolean;
}

interface RootCtx {
  activeItem: ItemHandle | null;
  activeItemName: string | null;
  activeItemRequired: boolean | null;
  activeItemStatus: QuestionnaireItemStatus | null;
  current: number;
  domVersion: number;
  first: boolean;
  goNext: () => void;
  goPrevious: () => void;
  itemDefinitionByName: Map<string, QuestionnaireItemDefinition> | null;
  last: boolean;
  nativeValidation: boolean;
  registerItem: (h: ItemHandle) => () => void;
  shortcuts: QuestionnaireShortcutMode | null;
  skipCurrent: () => void;
  total: number;
}

interface ItemCtx {
  active: boolean;
  disabled: boolean;
  hasInputAnswer: boolean;
  invalid: boolean;
  multiple: boolean;
  name: string;
  registerAnswerControl: (c: AnswerControl) => () => void;
  registerAnswerSelection: (id: string, def: boolean) => () => void;
  registerDescription: (id: string) => () => void;
  registerError: (id: string) => () => void;
  required: boolean;
  resetVersion: number;
  selectedAnswerIds: string[];
  setAnswerDefault: (id: string, def: boolean) => void;
  setAnswerSelectionFromInteraction: (id: string, sel: boolean) => void;
  shortcutByAnswerId: Map<string, string>;
  shortcutByChoiceValue: Map<string, string> | null;
  shortcuts: QuestionnaireShortcutMode | null;
  status: QuestionnaireItemStatus;
  syncControlledAnswerSelection: (id: string, checked: boolean) => void;
}

interface ChoiceCtx {
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.RefCallback<HTMLInputElement>;
  };
  state: QuestionnaireChoiceState;
}

const RootContext = React.createContext<RootCtx | null>(null);
const ItemContext = React.createContext<ItemCtx | null>(null);
const ChoiceContext = React.createContext<ChoiceCtx | null>(null);

function useRoot(caller: string): RootCtx {
  const ctx = React.useContext(RootContext);
  if (!ctx) {
    throw new Error(`${caller} must be used within Questionnaire.Root.`);
  }
  return ctx;
}

function useItem(caller: string): ItemCtx {
  const ctx = React.useContext(ItemContext);
  if (!ctx) {
    throw new Error(`${caller} must be used within Questionnaire.Item.`);
  }
  return ctx;
}

function useChoice(caller: string): ChoiceCtx {
  const ctx = React.useContext(ChoiceContext);
  if (!ctx) {
    throw new Error(`${caller} must be used within Questionnaire.Choice.`);
  }
  return ctx;
}

// ============================================================
// Choice hook
// ============================================================

function useChoiceHook({
  checked: controlledChecked,
  defaultChecked = false,
  disabled: ownDisabled = false,
  onChange,
  value,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
}): ChoiceCtx {
  const item = useItem("Questionnaire.Choice");
  const id = React.useId();
  const [inputEl, setInputEl] = React.useState<HTMLInputElement | null>(null);
  const initialChecked = React.useRef(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isDisabled = item.disabled || ownDisabled;
  const isSelected = item.selectedAnswerIds.includes(id);
  const isChecked = isControlled
    ? item.status === "skipped"
      ? false
      : controlledChecked
    : isSelected;
  const type = item.multiple ? "checkbox" : "radio";
  const shortcut =
    item.shortcutByChoiceValue?.get(value) ??
    item.shortcutByAnswerId.get(id) ??
    null;

  React.useLayoutEffect(
    () => item.registerAnswerSelection(id, initialChecked.current),
    [id, item.registerAnswerSelection]
  );
  React.useLayoutEffect(
    () => item.setAnswerDefault(id, defaultChecked),
    [id, defaultChecked, item.setAnswerDefault]
  );

  React.useLayoutEffect(() => {
    if (!inputEl) {
      return;
    }
    return item.registerAnswerControl({
      disabled: isDisabled,
      element: inputEl,
      id,
      ownDisabled,
      type: "choice",
      value,
    });
  }, [id, ownDisabled, isDisabled, inputEl, item.registerAnswerControl, value]);

  React.useLayoutEffect(() => {
    if (isControlled && controlledChecked !== undefined) {
      item.syncControlledAnswerSelection(id, controlledChecked);
    }
  }, [
    id,
    isControlled,
    controlledChecked,
    item.resetVersion,
    item.syncControlledAnswerSelection,
  ]);

  React.useLayoutEffect(() => {
    if (!inputEl) {
      return;
    }
    inputEl.defaultChecked =
      isControlled && controlledChecked !== undefined
        ? controlledChecked
        : defaultChecked;
    if (item.resetVersion > 0) {
      inputEl.checked = !!isChecked;
    }
  }, [
    isChecked,
    isControlled,
    controlledChecked,
    defaultChecked,
    inputEl,
    item.resetVersion,
  ]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (!isControlled) {
      item.setAnswerSelectionFromInteraction(id, event.target.checked);
      return;
    }
    if (
      item.status === "skipped" &&
      controlledChecked === event.target.checked
    ) {
      item.setAnswerSelectionFromInteraction(id, controlledChecked);
    }
  }

  const state: QuestionnaireChoiceState = {
    checked: !!isChecked,
    disabled: isDisabled,
    invalid: item.invalid,
    shortcut,
    type,
  };

  return {
    inputProps: {
      "aria-invalid": item.invalid || undefined,
      "aria-keyshortcuts": formatShortcut(shortcut, !isDisabled && !!isChecked),
      checked: !!isChecked,
      disabled: isDisabled,
      id,
      name: item.status === "skipped" ? undefined : item.name,
      onChange: handleChange,
      ref: setInputEl,
      required: item.required && !item.multiple && !item.hasInputAnswer,
      type,
      value,
    },
    state,
  };
}

// ============================================================
// Input hook
// ============================================================

function useInputHook({
  defaultValue,
  disabled: ownDisabled = false,
  onChange,
  type = "text",
  value: controlledValue,
  ref: externalRef,
}: {
  defaultValue?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: QuestionnaireInputType;
  value?: string;
  ref?: React.Ref<HTMLInputElement>;
}): {
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.RefCallback<HTMLInputElement>;
  };
  state: QuestionnaireInputState;
} {
  const item = useItem("Questionnaire.Input");
  const id = React.useId();
  const inputEl = React.useRef<HTMLInputElement>(null);
  const initialFilled = React.useRef(hasValue(defaultValue));
  const isControlled = controlledValue !== undefined;
  const normalizedValue = isControlled ? String(controlledValue) : undefined;
  const initFilled = hasValue(defaultValue);
  const ctrlFilled = hasValue(controlledValue);
  const [filled, setFilled] = React.useState(initFilled);
  const isDisabled = item.disabled || ownDisabled;
  const currentFilled = isControlled ? ctrlFilled : filled;
  const isSelected = item.selectedAnswerIds.includes(id);

  React.useLayoutEffect(
    () => item.registerAnswerSelection(id, initialFilled.current),
    [id, item.registerAnswerSelection]
  );
  React.useLayoutEffect(
    () => item.setAnswerDefault(id, initFilled),
    [initFilled, id, item.setAnswerDefault]
  );

  React.useLayoutEffect(() => {
    const el = inputEl.current;
    if (!el) {
      return;
    }
    return item.registerAnswerControl({
      disabled: isDisabled,
      element: el,
      id,
      type: "input",
    });
  }, [isDisabled, id, item.registerAnswerControl]);

  React.useLayoutEffect(() => {
    if (isControlled) {
      item.setAnswerDefault(id, ctrlFilled);
      return;
    }
    if (item.resetVersion > 0) {
      setFilled(initFilled);
    }
  }, [
    isControlled,
    ctrlFilled,
    controlledValue,
    initFilled,
    id,
    item.resetVersion,
    item.setAnswerDefault,
  ]);

  React.useLayoutEffect(() => {
    const el = inputEl.current;
    if (!(el && isControlled)) {
      return;
    }
    el.defaultValue = normalizedValue ?? "";
  }, [isControlled, controlledValue]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const nextFilled = event.target.value.trim().length > 0;
    if (isControlled) {
      return;
    }
    setFilled(nextFilled);
    item.setAnswerSelectionFromInteraction(id, nextFilled);
  }

  function setRef(node: HTMLInputElement | null) {
    inputEl.current = node;
    if (typeof externalRef === "function") {
      externalRef(node);
    } else if (externalRef) {
      (externalRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
    }
  }

  return {
    inputProps: {
      "aria-invalid": item.invalid || undefined,
      "aria-keyshortcuts": formatShortcut(
        null,
        !isDisabled && currentFilled && isSelected
      ),
      defaultValue: isControlled ? undefined : defaultValue,
      disabled: isDisabled,
      form: isSelected ? undefined : "",
      id,
      name: isSelected ? item.name : undefined,
      onChange: handleChange,
      ref: setRef,
      type,
      value: normalizedValue,
    },
    state: {
      disabled: isDisabled,
      filled: currentFilled,
      invalid: item.invalid,
    },
  };
}

// ============================================================
// Item hook
// ============================================================

function computeShortcuts(
  def: QuestionnaireItemDefinition,
  mode: QuestionnaireShortcutMode | null
): Map<string, string> | null {
  const out = new Map<string, string>();
  if (!(def.choices && mode)) {
    return out;
  }
  const chars = shortcutsFor(mode);
  let i = 0;
  for (const c of def.choices) {
    if (c.disabled) {
      continue;
    }
    const ch = chars[i];
    if (!ch) {
      break;
    }
    out.set(c.value, ch);
    i++;
  }
  return out;
}

function useItemHook({
  disabled: ownDisabled = false,
  invalid = false,
  multiple = false,
  name,
  onStatusChange,
  ref: externalRef,
  required = false,
}: {
  "aria-describedby"?: string;
  "aria-keyshortcuts"?: string;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  name: string;
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
  ref?: React.Ref<HTMLElement>;
  required?: boolean;
}) {
  const root = useRoot("Questionnaire.Item");
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const [controls, setControls] = React.useState<AnswerControl[]>([]);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isSkipped, setSkipped] = React.useState(false);
  const [resetVersion, setResetVersion] = React.useState(0);
  const [descriptionIds, setDescriptionIds] = React.useState<string[]>([]);
  const [errorIds, setErrorIds] = React.useState<string[]>([]);
  const defaultsRef = React.useRef<string[]>([]);
  const multipleRef = React.useRef(multiple);
  const prevMultiple = React.useRef(multiple);
  multipleRef.current = multiple;

  const isActive = !ownDisabled && root.activeItemName === name;
  const sortedControls = React.useMemo(
    () => [...controls].sort(byDOMOrder),
    [controls, root.domVersion]
  );
  const enabledControls = React.useMemo(
    () => sortedControls.filter((c) => !c.disabled),
    [sortedControls]
  );
  const hasAnswerSelected = enabledControls.some((c) =>
    selectedIds.includes(c.id)
  );
  const status: QuestionnaireItemStatus = isSkipped
    ? "skipped"
    : hasAnswerSelected
      ? "answered"
      : "unanswered";
  const isOptionalSkipped = status === "skipped" && !required;
  const invalidResolved =
    ownDisabled || isOptionalSkipped || (!invalid && status === "answered");
  const showInvalid =
    !(ownDisabled || isOptionalSkipped) &&
    (invalid || (hasSubmitted && !invalidResolved));
  const hasInputAnswer = enabledControls.some((c) => c.type === "input");
  const prevStatus = React.useRef(status);
  const itemDef = root.itemDefinitionByName?.get(name);
  const shortcutByChoiceValue = React.useMemo(
    () => (itemDef ? computeShortcuts(itemDef, root.shortcuts) : null),
    [itemDef, root.shortcuts]
  );
  const shortcutByAnswerId = React.useMemo(() => {
    if (shortcutByChoiceValue) {
      return new Map<string, string>();
    }
    const chars = shortcutsFor(root.shortcuts);
    const choiceControls = enabledControls.filter((c) => c.type === "choice");
    return new Map(
      choiceControls.slice(0, chars.length).map((c, i) => [c.id, chars[i]])
    );
  }, [enabledControls, shortcutByChoiceValue, root.shortcuts]);

  const registerAnswerControl = React.useCallback((control: AnswerControl) => {
    setControls((prev) => [
      ...prev.filter(
        (c) => c.element !== control.element && c.id !== control.id
      ),
      control,
    ]);
    return () => setControls((prev) => prev.filter((c) => c !== control));
  }, []);

  React.useLayoutEffect(() => {
    if (prevStatus.current !== status) {
      prevStatus.current = status;
      onStatusChange?.(status);
    }
  }, [onStatusChange, status]);

  const setAnswerSelection = React.useCallback(
    (id: string, selected: boolean) => {
      setSelectedIds((prev) =>
        selected
          ? multiple
            ? prev.includes(id)
              ? prev
              : [...prev, id]
            : [id]
          : prev.filter((x) => x !== id)
      );
    },
    [multiple]
  );

  const setAnswerSelectionFromInteraction = React.useCallback(
    (id: string, selected: boolean) => {
      setSkipped(false);
      setAnswerSelection(id, selected);
    },
    [setAnswerSelection]
  );

  const syncControlledAnswerSelection = React.useCallback(
    (id: string, selected: boolean) => {
      if (selected) {
        setSkipped(false);
      }
      setAnswerSelection(id, selected);
    },
    [setAnswerSelection]
  );

  const registerAnswerSelection = React.useCallback(
    (id: string, defaultValue: boolean) => {
      if (defaultValue) {
        defaultsRef.current = [
          ...defaultsRef.current.filter((x) => x !== id),
          id,
        ];
        setSelectedIds((prev) =>
          multipleRef.current
            ? prev.includes(id)
              ? prev
              : [...prev, id]
            : prev.length
              ? prev
              : [id]
        );
      }
      return () => {
        defaultsRef.current = defaultsRef.current.filter((x) => x !== id);
        setSelectedIds((prev) => prev.filter((x) => x !== id));
      };
    },
    []
  );

  const setAnswerDefault = React.useCallback(
    (id: string, defaultValue: boolean) => {
      if (defaultValue) {
        defaultsRef.current = defaultsRef.current.includes(id)
          ? defaultsRef.current
          : [...defaultsRef.current, id];
        return;
      }
      defaultsRef.current = defaultsRef.current.filter((x) => x !== id);
    },
    []
  );

  const registerDescription = React.useCallback((id: string) => {
    setDescriptionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => setDescriptionIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const registerError = React.useCallback((id: string) => {
    setErrorIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => setErrorIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const validate = React.useCallback(() => {
    setHasSubmitted(true);
    if (!invalidResolved) {
      return false;
    }
    if (!root.nativeValidation) {
      return true;
    }
    const invalidEl = enabledControls.find(
      (c) =>
        isAnswered(c) &&
        (c.element as HTMLInputElement).willValidate &&
        !(c.element as HTMLInputElement).validity.valid
    );
    if (invalidEl) {
      (invalidEl.element as HTMLInputElement).focus();
      (invalidEl.element as HTMLInputElement).reportValidity();
      return false;
    }
    return true;
  }, [enabledControls, root.nativeValidation, invalidResolved]);

  const focus = React.useCallback(() => element?.focus(), [element]);
  const focusInvalid = React.useCallback(() => {
    const filled = element?.querySelector<HTMLInputElement>(
      "input[data-filled][name]:not(:disabled)"
    );
    const any = element?.querySelector<HTMLInputElement>(
      "input:not([type=hidden]):not(:disabled), textarea:not(:disabled)"
    );
    (filled ?? any ?? element)?.focus();
  }, [element]);

  const reset = React.useCallback(() => {
    setHasSubmitted(false);
    setSkipped(false);
    setSelectedIds(
      multiple ? [...defaultsRef.current] : defaultsRef.current.slice(0, 1)
    );
    setResetVersion((v) => v + 1);
  }, [multiple]);

  const skip = React.useCallback(() => {
    if (required) {
      return;
    }
    setSelectedIds([]);
    setSkipped(true);
  }, [required]);

  React.useLayoutEffect(() => {
    const wasMultiple = prevMultiple.current;
    prevMultiple.current = multiple;
    if (!wasMultiple || multiple) {
      return;
    }
    setSelectedIds((prev) => {
      const first = enabledControls.find((c) => prev.includes(c.id));
      return first ? [first.id] : [];
    });
  }, [enabledControls, multiple]);

  const getAnswerByElement = React.useCallback(
    (el: Element) => enabledControls.find((c) => c.element === el) ?? null,
    [enabledControls]
  );
  const getAnswerByShortcut = React.useCallback(
    (shortcut: string) => {
      if (shortcutByChoiceValue) {
        const value = Array.from(shortcutByChoiceValue.entries()).find(
          ([, s]) => s === shortcut
        )?.[0];
        return (
          enabledControls.find(
            (c) => c.type === "choice" && c.value === value
          ) ?? null
        );
      }
      const id = Array.from(shortcutByAnswerId.entries()).find(
        ([, s]) => s === shortcut
      )?.[0];
      return enabledControls.find((c) => c.id === id) ?? null;
    },
    [enabledControls, shortcutByAnswerId, shortcutByChoiceValue]
  );
  const moveAnswerFocus = React.useCallback(
    (el: Element, dir: "next" | "previous") => {
      const index = enabledControls.findIndex((c) => c.element === el);
      const current = index < 0 ? null : (enabledControls[index] ?? null);
      if (!enabledControls.length) {
        return false;
      }
      if (isInteractive(el) && !isSkippableInput(current)) {
        return false;
      }
      if (index < 0 && el !== element) {
        return false;
      }
      const next =
        index < 0
          ? (enabledControls.find(isAnswered) ??
            (dir === "next" ? enabledControls[0] : enabledControls.at(-1)))
          : enabledControls[
              (index + (dir === "next" ? 1 : -1) + enabledControls.length) %
                enabledControls.length
            ];
      if (!next || next.element === el) {
        return false;
      }
      if (index >= 0 && isRadio(el) && isRadio(next.element)) {
        return false;
      }
      (next.element as HTMLElement).focus();
      if (next.type === "choice" && isRadio(next.element)) {
        (next.element as HTMLInputElement).click();
      }
      return true;
    },
    [enabledControls, element]
  );

  React.useLayoutEffect(() => {
    if (!element) {
      return;
    }
    return root.registerItem({
      choices: sortedControls.flatMap((c) => {
        if (c.type !== "choice" || c.value === undefined) {
          return [];
        }
        return [{ disabled: c.ownDisabled, value: c.value }];
      }),
      disabled: ownDisabled,
      element,
      focus,
      focusInvalid,
      getAnswerByElement,
      getAnswerByShortcut,
      moveAnswerFocus,
      name,
      required,
      reset,
      skip,
      status,
      validate,
    });
  }, [
    sortedControls,
    ownDisabled,
    element,
    focus,
    focusInvalid,
    getAnswerByElement,
    getAnswerByShortcut,
    moveAnswerFocus,
    name,
    root.registerItem,
    required,
    reset,
    skip,
    status,
    validate,
  ]);

  const context: ItemCtx = React.useMemo(
    () => ({
      active: isActive,
      disabled: ownDisabled,
      hasInputAnswer,
      invalid: showInvalid,
      multiple,
      name,
      registerAnswerControl,
      registerAnswerSelection,
      registerDescription,
      registerError,
      required,
      resetVersion,
      selectedAnswerIds: selectedIds,
      setAnswerDefault,
      setAnswerSelectionFromInteraction,
      shortcutByAnswerId,
      shortcutByChoiceValue,
      shortcuts: root.shortcuts,
      status,
      syncControlledAnswerSelection,
    }),
    [
      isActive,
      ownDisabled,
      hasInputAnswer,
      showInvalid,
      multiple,
      name,
      registerAnswerControl,
      registerAnswerSelection,
      registerDescription,
      registerError,
      required,
      resetVersion,
      selectedIds,
      setAnswerDefault,
      setAnswerSelectionFromInteraction,
      shortcutByAnswerId,
      shortcutByChoiceValue,
      root.shortcuts,
      status,
      syncControlledAnswerSelection,
    ]
  );

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      setElement(node);
      if (typeof externalRef === "function") {
        externalRef(node);
      } else if (externalRef) {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
    [externalRef]
  );

  const describedBy =
    [...descriptionIds, ...(showInvalid ? errorIds : []), undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  const ariaShortcut =
    [
      isActive ? "Meta+Enter Control+Enter" : undefined,
      isActive && enabledControls.length ? "ArrowUp ArrowDown" : undefined,
      isActive && !root.first ? "ArrowLeft" : undefined,
      isActive && !root.last && status !== "unanswered"
        ? "ArrowRight"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return {
    context,
    itemProps: {
      "aria-describedby": describedBy,
      "aria-invalid": showInvalid || undefined,
      "aria-keyshortcuts": ariaShortcut,
      disabled: ownDisabled,
      hidden: !isActive,
      inert: !isActive,
      ref: setRef,
      tabIndex: -1 as const,
    },
    state: {
      active: isActive,
      disabled: ownDisabled,
      invalid: showInvalid,
      multiple,
      required,
      status,
    },
  };
}

// ============================================================
// Root hook
// ============================================================

function buildItemDefinitions(
  defs: readonly QuestionnaireItemDefinition[] | undefined
): {
  enabledItems: QuestionnaireItemDefinition[];
  itemByName: Map<string, QuestionnaireItemDefinition>;
  items: QuestionnaireItemDefinition[];
} | null {
  if (defs === undefined) {
    return null;
  }
  return {
    enabledItems: defs.filter((d) => !d.disabled),
    itemByName: new Map(defs.map((d) => [d.name, d])),
    items: [...defs],
  };
}

function resolveInitialItem(
  defs: ReturnType<typeof buildItemDefinitions>,
  explicit: string | undefined
): string | null {
  if (!defs) {
    return explicit ?? null;
  }
  const found = explicit ? defs.itemByName.get(explicit) : undefined;
  if (found && !found.disabled) {
    return found.name;
  }
  return defs.enabledItems[0]?.name ?? null;
}

function useRootHook({
  defaultItem,
  item,
  items,
  noValidate = true,
  onItemChange,
  onReset,
  onSubmit,
  ref: externalRef,
  shortcuts,
}: {
  defaultItem?: string;
  item?: string;
  items?: readonly QuestionnaireItemDefinition[];
  noValidate?: boolean;
  onItemChange?: (item: string) => void;
  onReset?: (event: React.FormEvent<HTMLFormElement>) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  ref?: React.Ref<HTMLFormElement>;
  shortcuts?: QuestionnaireShortcutMode;
}) {
  const defs = React.useMemo(() => buildItemDefinitions(items), [items]);
  const [registeredItems, setRegisteredItems] = React.useState<ItemHandle[]>(
    []
  );
  const [activeItemName, setActiveItemName] = React.useState<string | null>(
    () => resolveInitialItem(defs, defaultItem)
  );
  const [formEl, setFormEl] = React.useState<HTMLFormElement | null>(null);
  const [domVersion, setDomVersion] = React.useState(0);
  const itemRef = React.useRef<HTMLFormElement | null>(null);
  const isControlled = item !== undefined;
  const currentName = isControlled ? item : activeItemName;
  const prevName = React.useRef(currentName);
  const nativeValidation = noValidate === false;
  const shortcutsValue: QuestionnaireShortcutMode | null = shortcuts ?? null;

  React.useLayoutEffect(() => {
    if (!formEl || typeof MutationObserver === "undefined") {
      return;
    }
    const obs = new MutationObserver(() => setDomVersion((v) => v + 1));
    obs.observe(formEl, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [formEl]);

  const enabledRegistered = React.useMemo(
    () => registeredItems.filter((i) => !i.disabled),
    [registeredItems]
  );
  const registeredByName = React.useMemo(
    () => new Map(enabledRegistered.map((i) => [i.name, i])),
    [enabledRegistered]
  );
  const allItems = defs?.enabledItems ?? registeredItems;
  const activeIndex = allItems.findIndex((i) => i.name === currentName);
  const activeItem =
    activeIndex < 0 || !currentName
      ? null
      : (registeredByName.get(currentName) ?? null);
  const def = currentName ? defs?.itemByName.get(currentName) : undefined;
  const activeRequired =
    activeIndex < 0
      ? null
      : def
        ? !!def.required
        : (activeItem?.required ?? false);
  const activeStatus =
    activeIndex < 0
      ? null
      : (activeItem?.status ?? (currentName ? "unanswered" : null));
  const total = allItems.length;
  const current = activeIndex < 0 ? 0 : activeIndex + 1;
  const isFirst = total > 0 && activeIndex === 0;
  const isLast = total > 0 && activeIndex === total - 1;

  const goTo = React.useCallback(
    (name: string, target: "item" | "invalid" = "item") => {
      if (name === currentName) {
        return;
      }
      itemRef.current = formEl;
      if (!isControlled) {
        setActiveItemName(name);
      }
      onItemChange?.(name);
    },
    [currentName, isControlled, onItemChange]
  );

  React.useLayoutEffect(() => {
    if (total === 0) {
      return;
    }
    if (activeIndex < 0) {
      if (!isControlled && currentName === null) {
        setActiveItemName(allItems[0].name);
        return;
      }
      goTo(allItems[0].name);
      return;
    }
    const prev = prevName.current;
    const changed = prev !== currentName;
    prevName.current = currentName;
    if (!changed) {
    }
    // focus is applied by item's own registration effect
  }, [
    activeItem,
    currentName,
    isControlled,
    activeIndex,
    allItems,
    goTo,
    total,
  ]);

  const registerItem = React.useCallback((handle: ItemHandle) => {
    setRegisteredItems((prev) => [
      ...prev.filter(
        (i) => i.element !== handle.element && i.name !== handle.name
      ),
      handle,
    ]);
    return () => setRegisteredItems((prev) => prev.filter((i) => i !== handle));
  }, []);

  const goPrevious = React.useCallback(() => {
    if (activeIndex <= 0) {
      return;
    }
    goTo(allItems[activeIndex - 1].name);
  }, [activeIndex, allItems, goTo]);

  const goNext = React.useCallback(() => {
    if (!activeItem || activeIndex >= total - 1) {
      return;
    }
    if (!activeItem.validate()) {
      activeItem.focusInvalid();
      return;
    }
    goTo(allItems[activeIndex + 1].name);
  }, [activeItem, activeIndex, total, allItems, goTo]);

  const submitOrNext = React.useCallback(() => {
    if (!activeItem) {
      return;
    }
    if (!activeItem.validate()) {
      activeItem.focusInvalid();
      return;
    }
    if (isLast) {
      formEl?.requestSubmit();
      return;
    }
    goTo(allItems[activeIndex + 1].name);
  }, [activeItem, activeIndex, isLast, allItems, formEl, goTo]);

  const skipCurrent = React.useCallback(() => {
    if (!activeItem || activeItem.required) {
      return;
    }
    activeItem.skip();
    if (!isLast) {
      goTo(allItems[activeIndex + 1].name);
      return;
    }
    queueMicrotask(() => formEl?.requestSubmit());
  }, [activeItem, activeIndex, isLast, allItems, formEl, goTo]);

  function handleReset(event: React.FormEvent<HTMLFormElement>) {
    onReset?.(event);
    if (event.defaultPrevented) {
      return;
    }
    for (const i of registeredItems) {
      i.reset();
    }
    const next = defs
      ? resolveInitialItem(defs, defaultItem)
      : (registeredItems.find((i) => i.name === defaultItem)?.name ??
        registeredItems[0]?.name);
    if (next) {
      goTo(next);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const bad = enabledRegistered.find((i) => !i.validate());
    if (bad) {
      event.preventDefault();
      goTo(bad.name, "invalid");
      if (bad.name === currentName) {
        bad.focusInvalid();
        itemRef.current = null;
      }
      return;
    }
    onSubmit?.(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (
      event.defaultPrevented ||
      (event.nativeEvent as KeyboardEvent).isComposing ||
      event.keyCode === 229 ||
      !activeItem ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    if (
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault();
      if (!event.repeat) {
        submitOrNext();
      }
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (
      (event.key === "ArrowUp" || event.key === "ArrowDown") &&
      activeItem.moveAnswerFocus(
        event.target,
        event.key === "ArrowDown" ? "next" : "previous"
      )
    ) {
      event.preventDefault();
      return;
    }
    if (
      (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
      !isInteractive(event.target) &&
      !isRadio(event.target)
    ) {
      event.preventDefault();
      if (event.repeat) {
        return;
      }
      if (event.key === "ArrowLeft") {
        goPrevious();
      } else if (activeItem.status !== "unanswered") {
        goNext();
      }
      return;
    }
    if (event.key === "Enter") {
      const target = activeItem.getAnswerByElement(event.target);
      if (!target) {
        return;
      }
      event.preventDefault();
      if (!event.repeat && isAnswered(target)) {
        submitOrNext();
      }
      return;
    }
    if (!shortcutsValue || isInteractive(event.target)) {
      return;
    }
    const s = matchShortcut(event.key, shortcutsValue);
    const target = s ? activeItem.getAnswerByShortcut(s) : null;
    if (!target) {
      return;
    }
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    (target.element as HTMLElement).focus();
    if (target.type === "choice") {
      (target.element as HTMLInputElement).click();
    }
  }

  const setFormRef = React.useCallback(
    (el: HTMLFormElement | null) => {
      setFormEl(el);
      if (typeof externalRef === "function") {
        externalRef(el);
      } else if (externalRef) {
        (
          externalRef as React.MutableRefObject<HTMLFormElement | null>
        ).current = el;
      }
    },
    [externalRef]
  );

  const context: RootCtx = React.useMemo(
    () => ({
      activeItem,
      activeItemName: currentName,
      activeItemRequired: activeRequired,
      activeItemStatus: activeStatus,
      current,
      domVersion,
      first: isFirst,
      goNext,
      goPrevious,
      itemDefinitionByName: defs?.itemByName ?? null,
      last: isLast,
      nativeValidation,
      registerItem,
      shortcuts: shortcutsValue,
      skipCurrent,
      total,
    }),
    [
      activeItem,
      currentName,
      activeRequired,
      activeStatus,
      current,
      domVersion,
      isFirst,
      goNext,
      goPrevious,
      defs,
      isLast,
      nativeValidation,
      registerItem,
      shortcutsValue,
      skipCurrent,
      total,
    ]
  );

  const rootProps: React.FormHTMLAttributes<HTMLFormElement> & {
    "data-shortcuts"?: string;
    ref: React.RefCallback<HTMLFormElement>;
  } = {
    "data-shortcuts": shortcutsValue ?? undefined,
    onKeyDown: handleKeyDown,
    onReset: handleReset,
    onSubmit: handleSubmit as React.FormEventHandler<HTMLFormElement>,
    ref: setFormRef,
  };

  return {
    context,
    rootProps,
    state: { current, first: isFirst, last: isLast, total },
  };
}

// ============================================================
// Components
// ============================================================

type RootProps = Omit<
  React.ComponentPropsWithRef<"form">,
  "defaultValue" | "value" | "onSubmit"
> & {
  defaultItem?: string;
  item?: string;
  items?: readonly QuestionnaireItemDefinition[];
  onItemChange?: (item: string) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  shortcuts?: QuestionnaireShortcutMode;
};

function QuestionnaireRoot({
  defaultItem,
  item,
  items,
  noValidate = true,
  onItemChange,
  onReset,
  onSubmit,
  ref,
  shortcuts,
  ...props
}: RootProps) {
  const { context, rootProps, state } = useRootHook({
    defaultItem,
    item,
    items,
    noValidate,
    onItemChange,
    onReset,
    onSubmit,
    ref,
    shortcuts,
  });
  const element = renderElement<"form", typeof state>({
    defaultTagName: "form",
    props: { ...rootProps, noValidate, ...props },
    state,
  });
  return React.createElement(RootContext.Provider, { value: context }, element);
}

function QuestionnaireProgress({
  children,
  render,
  ...props
}: Omit<React.ComponentPropsWithRef<"div">, "children"> & {
  children?: React.ReactNode;
  render?:
    | React.ReactElement
    | ((
        props: Record<string, unknown>,
        state: QuestionnaireRootState
      ) => React.ReactNode);
}) {
  const { current, first, last, total } = useRoot("Questionnaire.Progress");
  const label = total ? `Question ${current} of ${total}` : undefined;
  return renderElement<"div", QuestionnaireRootState>({
    defaultTagName: "div",
    props: {
      "aria-label": "Questionnaire progress",
      "aria-live": "polite",
      "aria-valuemax": total || undefined,
      "aria-valuemin": total ? 1 : undefined,
      "aria-valuenow": total ? current : undefined,
      "aria-valuetext": label,
      children: children ?? label,
      role: "progressbar",
      ...props,
    },
    render,
    state: { current, first, last, total },
  });
}

type ItemProps = Omit<
  React.ComponentPropsWithRef<"fieldset">,
  "name" | "value"
> & {
  invalid?: boolean;
  name: string;
  multiple?: boolean;
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
  required?: boolean;
};

function QuestionnaireItem({
  "aria-describedby": ariaDescribedBy,
  "aria-keyshortcuts": ariaKeyShortcuts,
  children,
  disabled = false,
  invalid = false,
  multiple = false,
  name,
  onStatusChange,
  ref,
  required = false,
  ...props
}: ItemProps) {
  const { context, itemProps, state } = useItemHook({
    "aria-describedby": ariaDescribedBy,
    "aria-keyshortcuts": ariaKeyShortcuts,
    disabled,
    invalid,
    multiple,
    name,
    onStatusChange,
    ref,
    required,
  });
  const element = renderElement<"fieldset", QuestionnaireItemState>({
    defaultTagName: "fieldset",
    props: { ...itemProps, children, ...props },
    state,
    stateAttributesMapping: {
      active: (v) => ({ "data-active": v ? "" : undefined }),
    },
  });
  return React.createElement(ItemContext.Provider, { value: context }, element);
}

function QuestionnaireTitle({
  render,
  ...props
}: React.ComponentPropsWithRef<"legend"> & {
  render?: React.ReactElement;
}) {
  useItem("Questionnaire.Title");
  return renderElement({
    defaultTagName: "legend",
    props,
    render,
    state: {},
  });
}

function QuestionnaireDescription({
  id,
  render,
  ...props
}: React.ComponentPropsWithRef<"p"> & {
  render?: React.ReactElement;
}) {
  const { registerDescription } = useItem("Questionnaire.Description");
  const genId = React.useId();
  const finalId = id ?? genId;
  React.useLayoutEffect(
    () => registerDescription(finalId),
    [finalId, registerDescription]
  );
  return renderElement({
    defaultTagName: "p",
    props: { id: finalId, ...props },
    render,
    state: {},
  });
}

function QuestionnaireChoices({
  render,
  ...props
}: React.ComponentPropsWithRef<"div"> & {
  render?:
    | React.ReactElement
    | ((
        props: Record<string, unknown>,
        state: { shortcuts: QuestionnaireShortcutMode | null }
      ) => React.ReactNode);
}) {
  const { shortcuts } = useItem("Questionnaire.Choices");
  return renderElement<"div", { shortcuts: QuestionnaireShortcutMode | null }>({
    defaultTagName: "div",
    props,
    render,
    state: { shortcuts },
  });
}

type ChoiceProps = Omit<React.ComponentPropsWithRef<"label">, "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  render?: React.ReactElement;
  value: string;
};

function QuestionnaireChoice({
  checked,
  children,
  defaultChecked = false,
  disabled = false,
  onChange,
  render,
  value,
  ...props
}: ChoiceProps) {
  const { inputProps, state } = useChoiceHook({
    checked,
    defaultChecked,
    disabled,
    onChange,
    value,
  });
  const element = renderElement<"label", QuestionnaireChoiceState>({
    defaultTagName: "label",
    props: { children, ...props },
    render,
    state,
    stateAttributesMapping: {
      checked: (v) => ({
        "data-checked": v ? "" : undefined,
        "data-unchecked": v ? undefined : "",
      }),
    },
  });
  return React.createElement(
    ChoiceContext.Provider,
    { value: { inputProps, state } },
    element
  );
}

function QuestionnaireChoiceInput({
  render,
  ...props
}: React.ComponentPropsWithRef<"input"> & {
  render?: React.ReactElement;
}) {
  const { inputProps, state } = useChoice("Questionnaire.ChoiceInput");
  return renderElement<"input", QuestionnaireChoiceState>({
    defaultTagName: "input",
    props: { ...inputProps, ...props },
    render,
    state,
    stateAttributesMapping: {
      checked: (v) => ({
        "data-checked": v ? "" : undefined,
        "data-unchecked": v ? undefined : "",
      }),
    },
  });
}

function QuestionnaireChoiceLabel({
  render,
  ...props
}: React.ComponentPropsWithRef<"span"> & {
  render?: React.ReactElement;
}) {
  useChoice("Questionnaire.ChoiceLabel");
  return renderElement({
    defaultTagName: "span",
    props,
    render,
    state: {},
  });
}

function QuestionnaireChoiceShortcut({
  children,
  render,
  ...props
}: React.ComponentPropsWithRef<"span"> & {
  render?: React.ReactElement;
}) {
  const { state } = useChoice("Questionnaire.ChoiceShortcut");
  return renderElement<"span", Pick<QuestionnaireChoiceState, "shortcut">>({
    defaultTagName: "span",
    props: {
      "aria-hidden": true,
      children: children ?? state.shortcut,
      hidden: state.shortcut === null,
      ...props,
    },
    render,
    state: { shortcut: state.shortcut },
  });
}

type InputProps = Omit<
  React.ComponentPropsWithRef<"input">,
  "form" | "name" | "type" | "value" | "defaultValue"
> & {
  defaultValue?: string;
  render?: React.ReactElement;
  type?: QuestionnaireInputType;
  value?: string;
};

function QuestionnaireInput({
  defaultValue,
  disabled = false,
  onChange,
  ref,
  render,
  type = "text",
  value,
  ...props
}: InputProps) {
  const { inputProps, state } = useInputHook({
    defaultValue,
    disabled,
    onChange,
    ref,
    type,
    value,
  });
  return renderElement<"input", QuestionnaireInputState>({
    defaultTagName: "input",
    props: { ...inputProps, ...props },
    render,
    state,
    stateAttributesMapping: {
      filled: (v) => ({
        "data-empty": v ? undefined : "",
        "data-filled": v ? "" : undefined,
      }),
    },
  });
}

function QuestionnaireError({
  children,
  id,
  render,
  ...props
}: React.ComponentPropsWithRef<"p"> & {
  render?: React.ReactElement;
}) {
  const { invalid, registerError, required } = useItem("Questionnaire.Error");
  const genId = React.useId();
  const finalId = id ?? genId;
  React.useLayoutEffect(() => registerError(finalId), [finalId, registerError]);
  return renderElement<"p", { invalid: boolean }>({
    defaultTagName: "p",
    props: {
      children:
        children ??
        (required
          ? "Choose an answer to continue."
          : "Choose an answer or skip this question."),
      hidden: !invalid,
      id: finalId,
      role: invalid ? "alert" : undefined,
      ...props,
    },
    render,
    state: { invalid },
  });
}

type NavProps = React.ComponentPropsWithRef<"button"> & {
  render?: React.ReactElement;
};

function renderNavButton({
  children,
  disabled = false,
  onClick: externalClick,
  props,
  render,
  shortcut,
  status,
  tabIndex,
  type = "button",
  visible,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  props: React.ComponentPropsWithRef<"button">;
  render?: React.ReactElement;
  shortcut?: "Enter" | null;
  status: QuestionnaireItemStatus | null;
  tabIndex?: number;
  type: "button" | "submit" | "reset";
  visible: boolean;
}) {
  const effectiveShortcut = visible && !disabled ? (shortcut ?? null) : null;
  return renderElement<"button", QuestionnaireNavigationState>({
    defaultTagName: "button",
    props: {
      "aria-hidden": !visible || undefined,
      "aria-keyshortcuts": effectiveShortcut ?? undefined,
      children,
      disabled,
      hidden: !visible,
      inert: !visible,
      onClick: externalClick,
      tabIndex: visible ? tabIndex : -1,
      type,
      ...props,
    },
    render,
    state: { disabled, shortcut: effectiveShortcut, status, visible },
    stateAttributesMapping: {
      visible: (v) => ({
        "data-hidden": v ? undefined : "",
        "data-visible": v ? "" : undefined,
      }),
    },
  });
}

function QuestionnairePrevious({
  children,
  disabled: disabledProp = false,
  onClick,
  render,
  tabIndex,
  type = "button",
  ...props
}: NavProps) {
  const ctx = useRoot("Questionnaire.Previous");
  const visible = ctx.total > 1 && !ctx.first;
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    ctx.goPrevious();
  }
  return renderNavButton({
    children: children ?? "Previous",
    disabled: disabledProp,
    onClick: handleClick,
    props,
    render,
    status: ctx.activeItemStatus,
    tabIndex,
    type,
    visible,
  });
}

function QuestionnaireSkip({
  children,
  disabled: disabledProp = false,
  onClick,
  render,
  tabIndex,
  type = "button",
  ...props
}: NavProps) {
  const ctx = useRoot("Questionnaire.Skip");
  const visible = ctx.activeItemRequired === false;
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    ctx.skipCurrent();
  }
  return renderNavButton({
    children: children ?? "Skip",
    disabled: disabledProp,
    onClick: handleClick,
    props,
    render,
    status: ctx.activeItemStatus,
    tabIndex,
    type,
    visible,
  });
}

function QuestionnaireNext({
  children,
  disabled: disabledProp = false,
  onClick,
  render,
  tabIndex,
  type = "button",
  ...props
}: NavProps) {
  const ctx = useRoot("Questionnaire.Next");
  const visible = ctx.total > 1 && !ctx.last;
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    ctx.goNext();
  }
  return renderNavButton({
    children: children ?? "Next",
    disabled: disabledProp,
    onClick: handleClick,
    props,
    render,
    shortcut: "Enter",
    status: ctx.activeItemStatus,
    tabIndex,
    type,
    visible,
  });
}

function QuestionnaireSubmit({
  children,
  disabled: disabledProp = false,
  render,
  tabIndex,
  type = "submit",
  ...props
}: Omit<NavProps, "onClick">) {
  const ctx = useRoot("Questionnaire.Submit");
  const visible = ctx.total > 0 && ctx.last;
  return renderNavButton({
    children: children ?? "Submit",
    disabled: disabledProp,
    onClick: () => {},
    props,
    render,
    shortcut: "Enter",
    status: ctx.activeItemStatus,
    tabIndex,
    type,
    visible,
  });
}

// ============================================================
// Export
// ============================================================

const Questionnaire = {
  Choice: QuestionnaireChoice,
  ChoiceInput: QuestionnaireChoiceInput,
  ChoiceLabel: QuestionnaireChoiceLabel,
  ChoiceShortcut: QuestionnaireChoiceShortcut,
  Choices: QuestionnaireChoices,
  Description: QuestionnaireDescription,
  Error: QuestionnaireError,
  Input: QuestionnaireInput,
  Item: QuestionnaireItem,
  Next: QuestionnaireNext,
  Previous: QuestionnairePrevious,
  Progress: QuestionnaireProgress,
  Root: QuestionnaireRoot,
  Skip: QuestionnaireSkip,
  Submit: QuestionnaireSubmit,
  Title: QuestionnaireTitle,
};

export { Questionnaire };
