"use client";

import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Tabs = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root
    className={cn("flex flex-col gap-2", className)}
    data-slot="tabs"
    {...props}
  />
);

const TabsList = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
      "outline-none",
      className
    )}
    data-slot="tabs-list"
    {...props}
  />
);

const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { sound?: string }) => (
  <TabsPrimitive.Trigger
    className={cn(
      "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow,opacity] duration-150 focus-visible:outline-none active:opacity-60 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    data-slot="tabs-trigger"
    {...props}
  />
);

const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      "flex-1 outline-none",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200",
      className
    )}
    data-slot="tabs-content"
    {...props}
  />
);

export { Tabs, TabsContent, TabsList, TabsTrigger };
