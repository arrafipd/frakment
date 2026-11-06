"use client";

import { motion } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import * as React from "react";

import { DURATION_SMOOTH, EASE_SMOOTH } from "@/lib/animation";
import { cn } from "@/lib/utils";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
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
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

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

  return (
    <CollapsiblePrimitive.CollapsibleContent asChild forceMount {...props}>
      <div className="w-full" ref={ref}>
        <motion.div
          animate={{ height: open ? "auto" : 0 }}
          className="w-full overflow-hidden"
          data-slot="collapsible-content"
          initial={false}
          transition={{ duration: DURATION_SMOOTH, ease: EASE_SMOOTH }}
        >
          <div className={cn("w-full", className)}>{children}</div>
        </motion.div>
      </div>
    </CollapsiblePrimitive.CollapsibleContent>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
