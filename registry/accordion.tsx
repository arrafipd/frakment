"use client";

import { ChevronDownIcon } from "lucide-react";
import { motion } from "motion/react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import * as React from "react";
import { DURATION_SMOOTH, EASE_SMOOTH } from "@/lib/animation";
import { cn } from "@/lib/utils";

const Accordion = ({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) => (
  <AccordionPrimitive.Root data-slot="accordion" {...props} />
);

const AccordionItem = ({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item
    className={cn("border-b last:border-b-0", className)}
    data-slot="accordion-item"
    {...props}
  />
);

const AccordionTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-slot="accordion-trigger"
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) => {
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
    <AccordionPrimitive.Content asChild forceMount {...props}>
      <div className="w-full" ref={ref}>
        <motion.div
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          className="w-full overflow-hidden text-sm"
          data-slot="accordion-content"
          initial={false}
          transition={{
            height: { duration: DURATION_SMOOTH, ease: EASE_SMOOTH },
            opacity: { duration: 0.2 },
          }}
        >
          <div className={cn("pt-0 pb-4", className)}>{children}</div>
        </motion.div>
      </div>
    </AccordionPrimitive.Content>
  );
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
