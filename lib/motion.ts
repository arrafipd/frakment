"use client";

import * as React from "react";

export interface ParsedMotion {
  disabled: boolean;
  duration: number;
  easing: string;
}

const durationRegex = /^(\d+(?:\.\d+)?)(ms|s)?$/u;
const cubicBezierRegex =
  /^cubic-bezier\(\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*\)$/u;

function warn(message: string): void {
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(`[motion] ${message}`);
  }
}

export function parseMotion(input?: string): ParsedMotion | null {
  if (input === undefined) {
    return null;
  }
  if (typeof input !== "string") {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed === "off") {
    return { disabled: true, duration: 0, easing: "linear" };
  }

  const tokens = trimmed.split(/\s+/u);
  let duration = 150;
  let index = 0;

  const head = tokens[0];
  const match = head.match(durationRegex);
  if (match) {
    const n = Number.parseFloat(match[1]);
    if (!Number.isNaN(n)) {
      duration = match[2] === "s" ? n * 1000 : n;
      index = 1;
    }
  }

  const rest = tokens.slice(index).join(" ");
  if (!rest) {
    return { disabled: false, duration, easing: "ease-in-out" };
  }

  if (cubicBezierRegex.test(rest)) {
    return { disabled: false, duration, easing: rest };
  }

  if (/^(spring|inertia|keyframes)/u.test(rest) || rest.startsWith("spring(")) {
    warn(`"${rest}" is not applicable to CSS-only components`);
    return null;
  }

  return { disabled: false, duration, easing: rest };
}

export function getTransition(parsed: ParsedMotion | null): string | undefined {
  if (!parsed) {
    return;
  }
  if (parsed.disabled) {
    return "none";
  }
  return `all ${parsed.duration}ms ${parsed.easing}`;
}

export function useMotionGuard(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  styleFingerprint?: string
): boolean {
  const [yielded, setYielded] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!(enabled && !yielded)) {
      return;
    }
    const el = ref.current;
    if (!el || typeof MutationObserver === "undefined") {
      return;
    }
    const observer = new MutationObserver(() => {
      observer.disconnect();
      setYielded(true);
    });
    observer.observe(el, { attributeFilter: ["style"], attributes: true });
    return () => {
      observer.disconnect();
    };
  }, [ref, enabled, yielded, styleFingerprint]);

  return yielded;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => undefined;
  }
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}
