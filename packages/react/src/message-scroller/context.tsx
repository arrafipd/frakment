"use client";

import * as React from "react";
import type {
  MessageScrollerDefaultScrollPosition,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
  MessageScrollerVisibilityState,
} from "./types";

export interface MessageScrollerContextValue {
  autoScroll: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  defaultScrollPosition: MessageScrollerDefaultScrollPosition;
  itemElements: Map<string, HTMLDivElement>;
  preserveScrollOnPrependRef: React.MutableRefObject<boolean>;
  registerItem: (id: string, el: HTMLDivElement) => () => void;
  scrollable: MessageScrollerScrollable;
  scrollEdgeThreshold: number;
  scrollMargin: number;
  scrollPreviousItemPeek: number;
  scrollToEnd: (opts?: MessageScrollerScrollOptions) => boolean;
  scrollToMessage: (
    messageId: string,
    opts?: MessageScrollerScrollOptions
  ) => boolean;
  scrollToStart: (opts?: MessageScrollerScrollOptions) => boolean;
  setContentPresent: (present: boolean) => void;
  setPreserveScrollOnPrepend: (v: boolean) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  visibility: MessageScrollerVisibilityState;
}

export const MessageScrollerContext =
  React.createContext<MessageScrollerContextValue | null>(null);

export function useMessageScrollerContext(): MessageScrollerContextValue {
  const ctx = React.useContext(MessageScrollerContext);
  if (!ctx) {
    throw new Error(
      "MessageScroller components must be used within <MessageScroller.Provider>"
    );
  }
  return ctx;
}
