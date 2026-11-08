"use client";

import * as React from "react";
import { useMessageScrollerContext } from "./context";
import type { MessageScrollerViewportProps } from "./types";
import { useMergedRef } from "./use-merged-ref";

export function MessageScrollerViewport({
  children,
  onScroll,
  preserveScrollOnPrepend,
  ref,
  ...props
}: MessageScrollerViewportProps) {
  const ctx = useMessageScrollerContext();
  const setRef = useMergedRef(ctx.viewportRef, ref);

  React.useEffect(() => {
    if (preserveScrollOnPrepend !== undefined) {
      ctx.setPreserveScrollOnPrepend(preserveScrollOnPrepend);
    }
  }, [preserveScrollOnPrepend, ctx]);

  return (
    <div onScroll={onScroll} ref={setRef} {...props}>
      {children}
    </div>
  );
}
