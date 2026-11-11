"use client";

import * as React from "react";
import {
  MessageScrollerContext,
  type MessageScrollerContextValue,
} from "./context";
import type {
  MessageScrollerDefaultScrollPosition,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
  MessageScrollerVisibilityState,
} from "./types";

interface Props {
  autoScroll?: boolean;
  children?: React.ReactNode;
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
  scrollEdgeThreshold?: number;
  scrollMargin?: number;
  scrollPreviousItemPeek?: number;
}

export function MessageScrollerProvider({
  children,
  autoScroll = true,
  defaultScrollPosition = "end",
  scrollEdgeThreshold = 16,
  scrollPreviousItemPeek = 40,
  scrollMargin = 0,
}: Props) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const itemElements = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const preserveScrollOnPrependRef = React.useRef(false);
  const [contentPresent, setContentPresent] = React.useState(false);
  const [scrollable, setScrollable] = React.useState<MessageScrollerScrollable>(
    { end: false, start: false }
  );
  const [visibility, setVisibility] =
    React.useState<MessageScrollerVisibilityState>({
      currentAnchorId: null,
      visibleMessageIds: [],
    });

  const setPreserveScrollOnPrepend = React.useCallback((v: boolean) => {
    preserveScrollOnPrependRef.current = v;
  }, []);

  const registerItem = React.useCallback((id: string, el: HTMLDivElement) => {
    itemElements.current.set(id, el);
    return () => {
      itemElements.current.delete(id);
    };
  }, []);

  const computeScrollable = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    const start = vp.scrollTop > scrollEdgeThreshold;
    const end =
      vp.scrollHeight - vp.clientHeight - vp.scrollTop > scrollEdgeThreshold;
    setScrollable((prev) =>
      prev.start === start && prev.end === end ? prev : { end, start }
    );
  }, [scrollEdgeThreshold]);

  const computeVisibility = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    const vpRect = vp.getBoundingClientRect();
    const visible: string[] = [];
    let currentAnchorId: string | null = null;
    let bestTop = Number.POSITIVE_INFINITY;
    itemElements.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > vpRect.top && r.top < vpRect.bottom) {
        visible.push(id);
        if (r.top >= vpRect.top - 1 && r.top < bestTop) {
          bestTop = r.top;
          currentAnchorId = id;
        }
      }
    });
    setVisibility((prev) => {
      if (
        prev.currentAnchorId === currentAnchorId &&
        prev.visibleMessageIds.length === visible.length &&
        prev.visibleMessageIds.every((v, i) => v === visible[i])
      ) {
        return prev;
      }
      return { currentAnchorId, visibleMessageIds: visible };
    });
  }, []);

  const onScroll = React.useCallback(() => {
    computeScrollable();
    computeVisibility();
  }, [computeScrollable, computeVisibility]);

  const scrollToEnd = React.useCallback(
    (opts?: MessageScrollerScrollOptions) => {
      const vp = viewportRef.current;
      if (!vp) {
        return false;
      }
      vp.scrollTo({
        behavior: opts?.behavior ?? "smooth",
        top: vp.scrollHeight,
      });
      return true;
    },
    []
  );

  const scrollToStart = React.useCallback(
    (opts?: MessageScrollerScrollOptions) => {
      const vp = viewportRef.current;
      if (!vp) {
        return false;
      }
      vp.scrollTo({ behavior: opts?.behavior ?? "smooth", top: 0 });
      return true;
    },
    []
  );

  const scrollToMessage = React.useCallback(
    (messageId: string, opts?: MessageScrollerScrollOptions) => {
      const el = itemElements.current.get(messageId);
      if (!el) {
        return false;
      }
      el.scrollIntoView({
        behavior: opts?.behavior ?? "smooth",
        block: opts?.align ?? "start",
        inline: "nearest",
      });
      return true;
    },
    []
  );

  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    vp.addEventListener("scroll", onScroll, { passive: true });
    computeScrollable();
    computeVisibility();
    return () => vp.removeEventListener("scroll", onScroll);
  }, [onScroll, computeScrollable, computeVisibility]);

  React.useEffect(() => {
    if (!contentPresent) {
      return;
    }
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    if (defaultScrollPosition === "start") {
      vp.scrollTop = 0;
    } else if (defaultScrollPosition === "end") {
      vp.scrollTop = vp.scrollHeight;
    }
  }, [contentPresent, defaultScrollPosition]);

  const value: MessageScrollerContextValue = {
    autoScroll,
    contentRef,
    defaultScrollPosition,
    itemElements: itemElements.current,
    preserveScrollOnPrependRef,
    registerItem,
    scrollable,
    scrollEdgeThreshold,
    scrollMargin,
    scrollPreviousItemPeek,
    scrollToEnd,
    scrollToMessage,
    scrollToStart,
    setContentPresent,
    setPreserveScrollOnPrepend,
    viewportRef,
    visibility,
  };

  return (
    <MessageScrollerContext.Provider value={value}>
      {children}
    </MessageScrollerContext.Provider>
  );
}
