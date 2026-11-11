"use client";

import * as React from "react";
import { useMessageScrollerContext } from "./context";
import type { MessageScrollerItemProps } from "./types";
import { useMergedRef } from "./use-merged-ref";

export function MessageScrollerItem({
  messageId,
  scrollAnchor,
  children,
  ref,
  ...props
}: MessageScrollerItemProps) {
  const ctx = useMessageScrollerContext();
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(localRef, ref);

  React.useEffect(() => {
    if (!(messageId && localRef.current)) {
      return;
    }
    return ctx.registerItem(messageId, localRef.current);
  }, [messageId, ctx]);

  return (
    <div
      data-scroll-anchor={scrollAnchor ? "true" : undefined}
      ref={setRef}
      {...props}
    >
      {children}
    </div>
  );
}
