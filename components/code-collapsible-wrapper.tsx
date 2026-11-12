"use client";

import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const COLLAPSE_THRESHOLD = 256;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export const CodeCollapsibleWrapper = ({
  className,
  children,
  navTriggerClassName,
  ...props
}: React.ComponentProps<typeof Collapsible> & {
  navTriggerClassName?: string;
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      setContentHeight(el.scrollHeight);
      setHasMeasured(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const needsCollapse = contentHeight > COLLAPSE_THRESHOLD;

  let targetHeight: number | "auto";
  if (!hasMeasured) {
    targetHeight = COLLAPSE_THRESHOLD;
  } else if (needsCollapse) {
    targetHeight = isOpened ? "auto" : COLLAPSE_THRESHOLD;
  } else {
    targetHeight = "auto";
  }

  return (
    <Collapsible
      className={cn("group/collapsible relative md:-mx-1", className)}
      onOpenChange={(open) => {
        setIsOpened(open);
        setHasInteracted(true);
      }}
      open={isOpened}
      {...props}
    >
      {needsCollapse && (
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "absolute top-1.5 right-9 z-10 flex items-center",
              navTriggerClassName
            )}
          >
            <Button
              className="text-muted-foreground h-7 rounded-md px-2"
              size="sm"
              variant="ghost"
            >
              {isOpened ? "Collapse" : "Expand"}
            </Button>
            <Separator className="mx-1.5 h-4!" orientation="vertical" />
          </div>
        </CollapsibleTrigger>
      )}

      <motion.div
        animate={{ height: targetHeight }}
        className="relative"
        initial={false}
        style={{ overflow: "hidden" }}
        transition={{
          duration: hasInteracted ? 0.3 : 0,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className="[&>figure]:mt-0 [&>figure]:md:mx-0!" ref={contentRef}>
          {children}
        </div>
      </motion.div>

      {needsCollapse && (
        <div className="from-code/70 to-code absolute inset-x-0 -bottom-2 flex h-20 items-center justify-center rounded-b-lg bg-linear-to-b group-data-[state=open]/collapsible:hidden">
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="outline">
              Expand
            </Button>
          </CollapsibleTrigger>
        </div>
      )}
    </Collapsible>
  );
};
