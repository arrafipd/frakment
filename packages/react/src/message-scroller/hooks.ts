"use client";

import { useMessageScrollerContext } from "./context";

export function useMessageScroller() {
  const ctx = useMessageScrollerContext();
  return {
    scrollToEnd: ctx.scrollToEnd,
    scrollToMessage: ctx.scrollToMessage,
    scrollToStart: ctx.scrollToStart,
  };
}

export function useMessageScrollerScrollable() {
  return useMessageScrollerContext().scrollable;
}

export function useMessageScrollerVisibility() {
  return useMessageScrollerContext().visibility;
}
