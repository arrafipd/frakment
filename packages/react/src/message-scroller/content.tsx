"use client";

import * as React from "react";
import { useMessageScrollerContext } from "./context";
import type { MessageScrollerContentProps } from "./types";

export function MessageScrollerContent({
  children,
  ...props
}: MessageScrollerContentProps) {
  const ctx = useMessageScrollerContext();

  React.useEffect(() => {
    ctx.setContentPresent(true);
    return () => ctx.setContentPresent(false);
  }, [ctx]);

  return (
    <div ref={ctx.contentRef} {...props}>
      {children}
    </div>
  );
}
