"use client";

import { ChevronRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import * as React from "react";

import { Shimmer } from "@/components/ui/shimmer";
import { SPRING_SMOOTH } from "@/lib/animation";
import { cn } from "@/lib/utils";

const TraceCollapsibleContext = React.createContext<{ open: boolean }>({
  open: false,
});

const TraceLineContext = React.createContext<{
  status?: "running" | "error" | "pending";
}>({});

const SPRING_SHARP = {
  damping: 32,
  mass: 0.7,
  stiffness: 420,
  type: "spring" as const,
};

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
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <TraceCollapsibleContext.Provider value={{ open: currentOpen }}>
      <CollapsiblePrimitive.Root
        className={cn("flex w-full min-w-0 flex-col", className)}
        data-slot="trace-collapsible"
        onOpenChange={handleOpenChange}
        open={currentOpen}
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
      className={cn(
        "group/trace-collapsible-trigger text-muted-foreground flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-2 text-left outline-none",
        "has-[[data-status=error]]:text-destructive",
        className
      )}
      data-slot="trace-collapsible-trigger"
      {...props}
    >
      <motion.div
        className="flex items-center gap-2"
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={shouldReduce ? undefined : { x: 1 }}
      >
        {children}
      </motion.div>
      <motion.span
        animate={{ rotate: open ? 90 : 0 }}
        aria-hidden
        className="flex shrink-0 items-center justify-center"
        initial={false}
        transition={shouldReduce ? { duration: 0 } : SPRING_SHARP}
      >
        <ChevronRightIcon className="text-muted-foreground size-3.5" />
      </motion.span>
    </CollapsiblePrimitive.Trigger>
  );
}

function TraceCollapsibleContent({
  className,
  children,
  keepMounted: _keepMounted,
  animateHeight = true,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content> & {
  keepMounted?: boolean;
  animateHeight?: boolean;
}) {
  const { open } = React.useContext(TraceCollapsibleContext);
  const shouldReduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const update = () => setHeight(el.scrollHeight);
    update();
    if (!open) {
      return;
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  if (!animateHeight) {
    return (
      <CollapsiblePrimitive.Content
        data-slot="trace-collapsible-content-wrapper"
        forceMount
        {...props}
      >
        <div style={{ display: open ? "block" : "none" }}>
          <div
            className={cn(
              "border-border mt-1 ml-2 border-l pb-1 pl-4",
              className
            )}
          >
            {children}
          </div>
        </div>
      </CollapsiblePrimitive.Content>
    );
  }

  return (
    <CollapsiblePrimitive.Content
      data-slot="trace-collapsible-content-wrapper"
      forceMount
      {...props}
    >
      <motion.div
        animate={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
        data-slot="trace-collapsible-content"
        initial={false}
        style={{ overflow: "hidden", willChange: "height" }}
        transition={
          shouldReduce
            ? { duration: 0 }
            : {
                height: SPRING_SMOOTH,
                opacity: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
              }
        }
      >
        <div ref={ref}>
          <div
            className={cn(
              "border-border mt-1 ml-2 border-l pb-1 pl-4",
              className
            )}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </CollapsiblePrimitive.Content>
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
