import type * as React from "react";

export type MessageScrollerDefaultScrollPosition =
  | "start"
  | "end"
  | "last-anchor";
export type MessageScrollerButtonDirection = "start" | "end";
export type MessageScrollerScrollAlign = "start" | "center" | "end" | "nearest";

export interface MessageScrollerScrollOptions {
  align?: MessageScrollerScrollAlign;
  behavior?: ScrollBehavior;
  scrollMargin?: number;
}
export interface MessageScrollerScrollable {
  end: boolean;
  start: boolean;
}
export interface MessageScrollerVisibilityState {
  currentAnchorId: string | null;
  visibleMessageIds: string[];
}
export interface MessageScrollerProviderProps {
  autoScroll?: boolean;
  children?: React.ReactNode;
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
  scrollEdgeThreshold?: number;
  scrollMargin?: number;
  scrollPreviousItemPeek?: number;
}
export type MessageScrollerProps = React.ComponentProps<"div">;

export type MessageScrollerViewportProps = React.ComponentProps<"div"> & {
  preserveScrollOnPrepend?: boolean;
};
export type MessageScrollerContentProps = React.ComponentProps<"div"> & {
  spacerClassName?: string;
};
export type MessageScrollerItemProps = React.ComponentProps<"div"> & {
  messageId?: string;
  scrollAnchor?: boolean;
};
export interface MessageScrollerButtonRenderState {
  active: boolean;
  direction: MessageScrollerButtonDirection;
}
export type MessageScrollerButtonProps = Omit<
  React.ComponentProps<"button">,
  "children" | "render"
> & {
  children?: React.ReactNode;
  behavior?: ScrollBehavior;
  direction?: MessageScrollerButtonDirection;
  render?: React.ReactElement;
};
