"use client";

import type { MessageScrollerProps } from "./types";

export function MessageScrollerRoot({
  children,
  ...props
}: MessageScrollerProps) {
  return <div {...props}>{children}</div>;
}
