"use client";

import { ChevronRightIcon } from "lucide-react";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Shimmer } from "@/components/ui/shimmer";
import { cn } from "@/lib/utils";

const defaultTraceMotion = "450 cubic-bezier(0.32, 0.72, 0, 1)";

interface TraceCollapsibleContextValue {
  motion: string;
  open: boolean;
}

const TraceCollapsibleContext =
  React.createContext<TraceCollapsibleContextValue>({
    motion: defaultTraceMotion,
    open: false,
  });

const TraceLineContext = React.createContext<{
  status?: "running" | "error" | "pending";
}>({});

function resolveTraceMotion(
  motion: string | undefined,
  animation: false | string | undefined,
  fallback: string
): string {
  if (motion !== undefined) {
    return motion;
  }
  if (animation === false) {
    return "off";
  }
  if (typeof animation === "string") {
    if (/^(spring|inertia|keyframes)/u.test(animation)) {
      console.warn(
        `[trace] animation="${animation}" uses a motion DSL that is not supported in CSS. Falling back to default. Prefer motion="150 ease-out" instead.`
      );
      return fallback;
    }
    return animation;
  }
  return fallback;
}

function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      data-slot="trace"
      {...props}
    />
  );
}

function TraceLine({
  className,
  status,
  ...props
}: React.ComponentProps<"span"> & {
  status?: "running" | "error" | "pending";
}) {
  return (
    <TraceLineContext.Provider value={{ status }}>
      <span
        className={cn(
          "text-muted-foreground flex w-fit max-w-full min-w-0 items-center gap-2",
          "data-[status=error]:text-destructive",
          "data-[status=pending]:opacity-60",
          "data-[status=running]:text-foreground",
          className
        )}
        data-slot="trace-line"
        data-status={status}
        {...props}
      />
    </TraceLineContext.Provider>
  );
}

function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:size-4",
        className
      )}
      data-slot="trace-icon"
      {...props}
    />
  );
}

function TraceTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { status } = React.useContext(TraceLineContext);
  const content =
    status === "running" ? <Shimmer>{children}</Shimmer> : children;
  return (
    <span
      className={cn("min-w-0 truncate", className)}
      data-slot="trace-title"
      {...props}
    >
      {content}
    </span>
  );
}

function TraceDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground/70 shrink-0 text-xs tabular-nums",
        className
      )}
      data-slot="trace-description"
      {...props}
    />
  );
}

type TraceCollapsibleProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  animation?: false | string;
  defaultOpen?: boolean;
  disabled?: boolean;
  motion?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

function TraceCollapsible({
  animation,
  children,
  className,
  defaultOpen,
  disabled,
  motion,
  onOpenChange,
  open: openProp,
  ...props
}: TraceCollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = openProp !== undefined;
  const currentOpen = isControlled ? openProp : internalOpen;
  const resolvedMotion = resolveTraceMotion(
    motion,
    animation,
    defaultTraceMotion
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <TraceCollapsibleContext.Provider
      value={{ motion: resolvedMotion, open: currentOpen }}
    >
      <Collapsible
        className={cn("flex w-full min-w-0 flex-col", className)}
        data-slot="trace-collapsible"
        disabled={disabled}
        motion={resolvedMotion}
        onOpenChange={handleOpenChange}
        open={currentOpen}
        {...props}
      >
        {children}
      </Collapsible>
    </TraceCollapsibleContext.Provider>
  );
}

function TraceCollapsibleTrigger({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { open } = React.useContext(TraceCollapsibleContext);
  return (
    <CollapsibleTrigger
      className={cn(
        "group/trace-collapsible-trigger text-muted-foreground flex w-full max-w-full min-w-0 cursor-pointer items-center gap-2 text-left outline-none",
        "has-[[data-status=error]]:text-destructive",
        className
      )}
      data-slot="trace-collapsible-trigger"
      onClick={onClick}
      {...props}
    >
      <span className="inline-flex max-w-full min-w-0 flex-1 items-center gap-2 transition-transform duration-200 hover:translate-x-px motion-reduce:transition-none motion-reduce:hover:translate-x-0">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center transition-transform duration-200 data-[state=open]:rotate-90 motion-reduce:transition-none"
        data-state={open ? "open" : "closed"}
      >
        <ChevronRightIcon className="text-muted-foreground size-3.5" />
      </span>
    </CollapsibleTrigger>
  );
}

type TraceCollapsibleContentProps = React.ComponentProps<"div"> & {
  animation?: false | string;
  animateHeight?: boolean;
  keepMounted?: boolean;
  motion?: string;
};

function TraceCollapsibleContent({
  animateHeight = true,
  animation,
  children,
  className,
  keepMounted: _keepMounted,
  motion,
  ...props
}: TraceCollapsibleContentProps) {
  const { motion: contextMotion } = React.useContext(TraceCollapsibleContext);
  const resolvedMotion = resolveTraceMotion(motion, animation, contextMotion);
  return (
    <CollapsibleContent
      motion={animateHeight ? resolvedMotion : false}
      {...props}
    >
      <div
        className={cn("border-border mt-1 ml-2 border-l pb-1 pl-4", className)}
        data-slot="trace-collapsible-content"
      >
        {children}
      </div>
    </CollapsibleContent>
  );
}

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
};
