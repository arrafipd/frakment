"use client";

import * as React from "react";
import { useMessageScrollerContext } from "./context";
import type { MessageScrollerButtonProps } from "./types";

export function MessageScrollerButton({
  direction = "end",
  behavior = "smooth",
  onClick,
  render,
  children,
  type = "button",
  ...props
}: MessageScrollerButtonProps) {
  const ctx = useMessageScrollerContext();
  const active =
    direction === "end" ? ctx.scrollable.end : ctx.scrollable.start;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }
    if (direction === "end") {
      ctx.scrollToEnd({ behavior });
    } else {
      ctx.scrollToStart({ behavior });
    }
  };

  const mergedProps = {
    ...props,
    children,
    "data-active": active ? "true" : "false",
    "data-direction": direction,
    onClick: handleClick,
    type,
  } as React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;

  if (render && React.isValidElement(render)) {
    return React.cloneElement(
      render as React.ReactElement<Record<string, unknown>>,
      mergedProps
    );
  }

  return <button {...mergedProps} />;
}
