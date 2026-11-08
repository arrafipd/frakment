"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const CodeCollapsibleWrapper = ({
  className,
  children,
  navTriggerClassName,
  ...props
}: React.ComponentProps<typeof Collapsible> & {
  navTriggerClassName?: string;
}) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Collapsible
      className={cn("group/collapsible relative md:-mx-1", className)}
      onOpenChange={setIsOpened}
      open={isOpened}
      {...props}
    >
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

      <motion.div
        animate={{
          height: isOpened ? "auto" : 256,
        }}
        className="relative mt-6 [&>figure]:mt-0 [&>figure]:md:mx-0!"
        initial={false}
        style={{ overflow: "hidden" }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {children}
      </motion.div>

      <div className="from-code/70 to-code absolute inset-x-0 -bottom-2 flex h-20 items-center justify-center rounded-b-lg bg-linear-to-b group-data-[state=open]/collapsible:hidden">
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="outline">
            Expand
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
};
