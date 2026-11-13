"use client";

import * as React from "react";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

function setRef(
  ref: React.Ref<HTMLElement> | undefined,
  node: HTMLElement | null
) {
  if (!ref) {
    return;
  }
  if (typeof ref === "function") {
    ref(node);
  } else {
    (ref as React.MutableRefObject<HTMLElement | null>).current = node;
  }
}

function mergeRefs(...refs: Array<React.Ref<HTMLElement> | undefined>) {
  return (node: HTMLElement | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

function Slot({ children, ref, ...slotProps }: SlotProps) {
  if (!React.isValidElement(children)) {
    return null;
  }
  const childProps = children.props as SlotProps;
  const merged: Record<string, unknown> = { ...slotProps, ...childProps };
  for (const key of Object.keys(slotProps)) {
    const slotValue = (slotProps as Record<string, unknown>)[key];
    const childValue = (childProps as Record<string, unknown>)[key];
    if (typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => unknown)(...args);
        (slotValue as (...a: unknown[]) => unknown)(...args);
      };
    }
  }
  merged.className =
    [slotProps.className, childProps.className].filter(Boolean).join(" ") ||
    undefined;
  merged.style = { ...slotProps.style, ...childProps.style };
  merged.ref = mergeRefs(ref, childProps.ref);
  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    merged
  );
}

export { Slot };
