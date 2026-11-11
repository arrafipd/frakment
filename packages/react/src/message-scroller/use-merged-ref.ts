"use client";

import * as React from "react";

export function useMergedRef<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  }, refs);
}
