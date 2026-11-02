"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { ChevronRightIcon } from "@/lib/icons";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const TraceCollapsibleContext = React.createContext<{ open: boolean }>({
  open: false,
});

const SPRING_SMOOTH = {
  type: "spring" as const,
  stiffness: 320,
  damping: 36,
  mass: 0.9,
};

const SPRING_SHARP = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.7,
};

function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
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
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-muted-foreground",
        "data-[status=error]:text-destructive",
        "data-[status=pending]:opacity-60",
        "data-[status=running]:text-foreground",
        "data-[status=running]:*:data-[slot=trace-title]:shimmer",
        className
      )}
      {...props}
    />
  );
}

function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-title"
      className={cn("min-w-0 truncate", className)}
      {...props}
    />
  );
}

function TraceDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-description"
      className={cn(
        "shrink-0 text-xs text-muted-foreground/70 tabular-nums",
        className
      )}
      {...props}
    />
  );
}

function TraceCollapsible({
  className,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <TraceCollapsibleContext.Provider value={{ open: currentOpen }}>
      <CollapsiblePrimitive.Root
        data-slot="trace-collapsible"
        className={cn("flex w-full min-w-0 flex-col", className)}
        open={currentOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </TraceCollapsibleContext.Provider>
  );
}

function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  const { open } = React.useContext(TraceCollapsibleContext);
  const shouldReduce = useReducedMotion();

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="trace-collapsible-trigger"
      className={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-2 text-left text-muted-foreground outline-none",
        "has-[[data-status=error]]:text-destructive",
        className
      )}
      {...props}
    >
      <motion.div
        className="flex items-center gap-2"
        whileHover={shouldReduce ? undefined : { x: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
      <motion.span
        aria-hidden
        animate={{ rotate: open ? 90 : 0 }}
        initial={false}
        transition={shouldReduce ? { duration: 0 } : SPRING_SHARP}
        className="flex shrink-0 items-center justify-center"
      >
        <ChevronRightIcon className="size-3.5 text-muted-foreground" />
      </motion.span>
    </CollapsiblePrimitive.Trigger>
  );
}

function TraceCollapsibleContent({
  className,
  children,
  keepMounted: _keepMounted,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content> & {
  keepMounted?: boolean;
}) {
  const { open } = React.useContext(TraceCollapsibleContext);
  const shouldReduce = useReducedMotion();

  return (
    <CollapsiblePrimitive.Content
      forceMount
      data-slot="trace-collapsible-content-wrapper"
      {...props}
    >
      <motion.div
        data-slot="trace-collapsible-content"
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={
          shouldReduce
            ? { duration: 0 }
            : {
                height: SPRING_SMOOTH,
                opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              }
        }
        style={{ overflow: "hidden", transform: "translateZ(0)" }}
      >
        <div
          className={cn(
            "mt-1 ml-2 border-l border-border pb-1 pl-4",
            className
          )}
        >
          {children}
        </div>
      </motion.div>
    </CollapsiblePrimitive.Content>
  );
}

export {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
};