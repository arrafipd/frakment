"use client";

import * as React from "react";

import {
  getTransition,
  parseMotion,
  useMotionGuard,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const ProgressContext = React.createContext<{ value?: number }>({});

type ProgressProps = Omit<React.ComponentProps<"div">, "role"> & {
  "aria-label"?: string;
  children?: React.ReactNode;
  max?: number;
  min?: number;
  motion?: string;
  value?: number;
};

function useProgressIndicatorStyle(
  value: number,
  min: number,
  max: number,
  motion: string | undefined,
  internalRef: React.RefObject<HTMLDivElement | null>
): React.CSSProperties {
  const reduce = useReducedMotion();
  const clamped = Math.min(Math.max(value, min), max);
  const range = Math.max(max - min, 1);
  const percent = ((clamped - min) / range) * 100;

  let style: React.CSSProperties = {
    transform: `translateX(-${100 - percent}%)`,
  };

  if (reduce) {
    style.transition = "none";
  } else if (motion !== undefined) {
    const transition = getTransition(parseMotion(motion));
    if (transition) {
      style.transition = transition;
    }
  }

  const motionEnabled = motion !== undefined && !reduce;
  const fingerprint = JSON.stringify(style);
  const yielded = useMotionGuard(internalRef, motionEnabled, fingerprint);
  if (yielded && !reduce) {
    style = { ...style, transition: "none" };
  }

  return style;
}

function ProgressBar({
  className,
  max = 100,
  min = 0,
  motion,
  value,
  ...props
}: ProgressProps) {
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  const safeValue = value ?? 0;
  const indicatorStyle = useProgressIndicatorStyle(
    safeValue,
    min,
    max,
    motion,
    internalRef
  );

  return (
    <div
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={safeValue}
      className={cn(
        "bg-primary/20 relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
        className
      )}
      data-slot="progress"
      role="progressbar"
      {...props}
    >
      <div
        className={cn(
          "bg-primary size-full flex-1",
          motion === undefined && "transition-transform duration-500 ease-out"
        )}
        data-slot="progress-indicator"
        ref={internalRef}
        style={indicatorStyle}
      />
    </div>
  );
}

function Progress({ className, value, children, ...props }: ProgressProps) {
  const normalizedValue = value ?? 0;

  if (!children) {
    return (
      <ProgressBar className={className} value={normalizedValue} {...props} />
    );
  }

  return (
    <ProgressContext.Provider value={{ value: normalizedValue }}>
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center justify-between gap-2">
          {children}
        </div>
        <ProgressBar value={normalizedValue} {...props} />
      </div>
    </ProgressContext.Provider>
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: React.ComponentProps<"span">) {
  const { value } = React.useContext(ProgressContext);
  return (
    <span
      className={cn("text-muted-foreground text-sm tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    >
      {value ?? 0}%
    </span>
  );
}

export { Progress, ProgressLabel, ProgressValue };
