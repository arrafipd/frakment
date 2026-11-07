"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

const ProgressContext = React.createContext<{ value?: number }>({});

function Progress({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  children?: React.ReactNode;
}) {
  const normalizedValue = value || 0;

  const bar = (
    <ProgressPrimitive.Root
      className={cn(
        "bg-primary/20 relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
        !children && className
      )}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="bg-primary size-full flex-1 transition-transform duration-500 ease-out"
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );

  if (!children) {
    return bar;
  }

  return (
    <ProgressContext.Provider value={{ value: normalizedValue }}>
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center justify-between gap-2">
          {children}
        </div>
        <ProgressPrimitive.Root
          className="bg-primary/20 relative flex h-1 w-full items-center overflow-x-hidden rounded-full"
          data-slot="progress"
          {...props}
        >
          <ProgressPrimitive.Indicator
            className="bg-primary size-full flex-1 transition-transform duration-500 ease-out"
            data-slot="progress-indicator"
            style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
          />
        </ProgressPrimitive.Root>
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
