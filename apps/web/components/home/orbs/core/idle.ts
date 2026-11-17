/**
 * Idle-callback helpers extracted from components/orbs.tsx.
 *
 * requestIdleCallback when available (with a 3000 ms timeout as a
 * safety net), otherwise a setTimeout(300) fallback for browsers
 * without it (Safari before 16.4).
 *
 * Behavior is identical to the original closure functions. `globalThis`
 * is used instead of `window` so the fallback branch keeps `setTimeout`
 * and `clearTimeout` typed (TypeScript narrows `window` to `never` after
 * the `typeof window !== "undefined"` check, which would otherwise cause
 * a false "does not exist on type never" error).
 */

export const idle = (fn: () => void): number => {
  const g = globalThis as unknown as {
    requestIdleCallback?: (
      cb: IdleRequestCallback,
      opts?: { timeout: number }
    ) => number;
    setTimeout: (fn: () => void, ms: number) => number;
  };
  if (typeof g.requestIdleCallback === "function") {
    return g.requestIdleCallback(fn, { timeout: 3000 });
  }
  return g.setTimeout(fn, 300);
};

export const cancelIdle = (id: number): void => {
  const g = globalThis as unknown as {
    cancelIdleCallback?: (id: number) => void;
    clearTimeout: (id: number) => void;
  };
  if (typeof g.cancelIdleCallback === "function") {
    g.cancelIdleCallback(id);
  } else {
    g.clearTimeout(id);
  }
};
