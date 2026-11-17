"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/docs/copy-button";
import { AgentsPopover } from "@/components/site/agents-popover";
import { getIconForPackageManager } from "@/components/site/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import frakment from "@/frakment.json";
import type { PackageManager } from "@/hooks/use-package-manager";
import { usePackageManager } from "@/hooks/use-package-manager";
import { cn } from "@/lib/utils";

const pmCommands = {
  bun: "bunx --bun",
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn",
};

const registryItemNames = frakment.components
  .map((item) => item.name)
  .toSorted((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
    })
  );

export const CommandBox = ({ className }: { className?: string }) => {
  const [packageManager, setPackageManager] = usePackageManager();

  const currentItemRef = useRef(registryItemNames[0]);
  const [itemIndex, setItemIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setItemIndex((i) => {
        const next = (i + 1) % registryItemNames.length;
        currentItemRef.current = registryItemNames[next];
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "bg-code text-code-foreground relative overflow-hidden rounded-lg text-sm",
        className
      )}
    >
      <Tabs
        className="gap-0"
        onValueChange={(value: string) => {
          setPackageManager(value as PackageManager);
        }}
        value={packageManager}
      >
        <div className="border-border/50 flex items-center gap-2 border-b px-3 py-1">
          <TabsList className="[&_svg]:text-muted-foreground rounded-none bg-transparent p-0 [&_svg]:me-2 [&_svg]:size-4">
            {getIconForPackageManager(packageManager)}

            {Object.entries(pmCommands).map(([key]) => (
              <TabsTrigger
                className="data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
                key={key}
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <pre className="-translate-y-px px-4 py-3.5">
          <code
            className="text-muted-foreground block text-left font-mono text-sm max-sm:leading-6"
            data-language="bash"
          >
            {Object.entries(pmCommands).map(([key, command]) => (
              <TabsContent asChild key={key} value={key}>
                <span className="block sm:inline-block">
                  <span className="select-none">$ </span>
                  {command} frakment@latest add{" "}
                  <span aria-hidden="true" className="select-none sm:hidden">
                    \
                  </span>
                </span>
              </TabsContent>
            ))}
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ opacity: 1, y: 0 }}
                className="text-foreground inline-block"
                exit={{ opacity: 0, y: 12 }}
                initial={{ opacity: 0, y: -12 }}
                key={itemIndex}
                transition={{ duration: 0.3 }}
              >
                {registryItemNames[itemIndex]}
              </motion.span>
            </AnimatePresence>
          </code>
        </pre>
      </Tabs>

      <AgentsPopover className="absolute top-2 right-10 z-10 h-7 w-7 gap-1.5 border-none px-2 opacity-70 hover:opacity-100 focus-visible:opacity-100 sm:w-auto [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5" />

      <CopyButton
        className="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
        event="copy_npm_command"
        value={() =>
          `${pmCommands[packageManager]} frakment@latest add ${currentItemRef.current}`
        }
      />
    </div>
  );
};
