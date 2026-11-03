"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ComponentPreviewTabsProps {
  align?: "center" | "start" | "end";
  className?: string;
  component: React.ReactNode;
  hideCode?: boolean;
  previewClassName?: string;
  source: React.ReactNode;
}

const transition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as const,
};

const variants = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  initial: { opacity: 0, y: 6 },
};

export function ComponentPreviewTabs({
  component,
  source,
  className,
  previewClassName,
  hideCode = false,
  align = "center",
}: ComponentPreviewTabsProps) {
  const [activeTab, setActiveTab] = React.useState<"preview" | "code">(
    "preview"
  );
  const [isMobileCodeVisible, setIsMobileCodeVisible] = React.useState(false);

  return (
    <div
      className={cn("group relative my-4 flex flex-col gap-2", className)}
      data-slot="component-preview"
    >
      <Tabs
        className="relative w-full gap-2"
        onValueChange={(v) => setActiveTab(v as "preview" | "code")}
        value={activeTab}
      >
        <TabsList className="bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-[3px]">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {!hideCode && <TabsTrigger value="code">Code</TabsTrigger>}
        </TabsList>
      </Tabs>

      <div className="relative">
        <AnimatePresence initial={false} mode="wait">
          {activeTab === "preview" ? (
            <motion.div
              animate="animate"
              className="relative rounded-md border"
              exit="exit"
              initial="initial"
              key="preview"
              transition={transition}
              variants={variants}
            >
              <div
                className={cn(
                  "preview flex w-full justify-center p-10",
                  "data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start",
                  previewClassName ? previewClassName : "min-h-[350px]"
                )}
                data-align={align}
              >
                {component}
              </div>

              {!hideCode && (
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 md:hidden">
                  <Button
                    className="h-7 rounded-md px-2 text-xs"
                    onClick={() => {
                      setActiveTab("code");
                      setIsMobileCodeVisible(true);
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    View Code
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              animate="animate"
              className="relative"
              exit="exit"
              initial="initial"
              key="code"
              transition={transition}
              variants={variants}
            >
              {source}
              {isMobileCodeVisible && (
                <Button
                  className="mb-2 h-7 rounded-md px-2 text-xs md:hidden"
                  onClick={() => {
                    setIsMobileCodeVisible(false);
                    setActiveTab("preview");
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Hide Code
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
