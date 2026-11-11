"use client";

import { motion, useReducedMotion } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import * as React from "react";
import { durationSlow, easeSmoothOut, parseAnimation } from "@/lib/animation";
import { cn } from "@/lib/utils";

const CollapsibleAnimationContext = React.createContext<
  false | string | undefined
>(undefined);

function Collapsible({
  animation,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  animation?: false | string;
}) {
  return (
    <CollapsibleAnimationContext.Provider value={animation}>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
    </CollapsibleAnimationContext.Provider>
  );
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  className,
  children,
  animation: localAnimation,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent> & {
  animation?: false | string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const contextAnimation = React.useContext(CollapsibleAnimationContext);
  const animation = localAnimation ?? contextAnimation;
  const anim = React.useMemo(() => parseAnimation(animation), [animation]);
  const prefersReduced = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const update = () => setOpen(el.getAttribute("data-state") === "open");
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributeFilter: ["data-state"], attributes: true });
    return () => observer.disconnect();
  }, []);

  const defaultTransition = { duration: durationSlow, ease: easeSmoothOut };
  const transition =
    animation === false || prefersReduced
      ? { duration: 0 }
      : (anim?.transition ?? defaultTransition);

  return (
    <CollapsiblePrimitive.CollapsibleContent asChild forceMount {...props}>
      <div className="w-full" ref={ref}>
        <motion.div
          animate={{ height: open ? "auto" : 0 }}
          className="w-full overflow-hidden"
          data-slot="collapsible-content"
          initial={false}
          transition={transition}
        >
          <div className={cn("w-full", className)}>{children}</div>
        </motion.div>
      </div>
    </CollapsiblePrimitive.CollapsibleContent>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
