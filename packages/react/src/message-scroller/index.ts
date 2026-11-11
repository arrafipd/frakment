"use client";

import { MessageScrollerButton } from "./button";
import { MessageScrollerContent } from "./content";
import { MessageScrollerItem } from "./item";
import { MessageScrollerProvider } from "./provider";
import { MessageScrollerRoot } from "./root";
import { MessageScrollerViewport } from "./viewport";

export const MessageScroller = {
  Button: MessageScrollerButton,
  Content: MessageScrollerContent,
  Item: MessageScrollerItem,
  Provider: MessageScrollerProvider,
  Root: MessageScrollerRoot,
  Viewport: MessageScrollerViewport,
};

export {
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "./hooks";

export type {
  MessageScrollerButtonDirection,
  MessageScrollerButtonProps,
  MessageScrollerButtonRenderState,
  MessageScrollerContentProps,
  MessageScrollerDefaultScrollPosition,
  MessageScrollerItemProps,
  MessageScrollerProps,
  MessageScrollerProviderProps,
  MessageScrollerScrollAlign,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
  MessageScrollerViewportProps,
  MessageScrollerVisibilityState,
} from "./types";
