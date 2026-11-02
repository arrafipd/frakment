"use client";

import { ChevronRightIcon, FileIcon, FolderIcon } from "@/lib/icons";
import { motion, useReducedMotion } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

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

const FILE_COLORS: Record<string, string> = {
  // Config / data
  json: "text-amber-600 dark:text-amber-400",
  jsonc: "text-amber-600 dark:text-amber-400",
  yaml: "text-amber-600 dark:text-amber-400",
  yml: "text-amber-600 dark:text-amber-400",
  toml: "text-red-600 dark:text-red-400",
  env: "text-yellow-600 dark:text-yellow-400",
  lock: "text-muted-foreground",

  // Styles
  css: "text-sky-600 dark:text-sky-400",
  scss: "text-pink-600 dark:text-pink-400",
  sass: "text-pink-600 dark:text-pink-400",

  // Code
  ts: "text-blue-600 dark:text-blue-400",
  tsx: "text-blue-600 dark:text-blue-400",
  js: "text-amber-500 dark:text-amber-400",
  jsx: "text-amber-500 dark:text-amber-400",
  mjs: "text-amber-500 dark:text-amber-400",
  cjs: "text-amber-500 dark:text-amber-400",

  // Frameworks
  astro: "text-orange-500 dark:text-orange-400",
  html: "text-orange-600 dark:text-orange-400",
  vue: "text-emerald-600 dark:text-emerald-400",
  svelte: "text-orange-600 dark:text-orange-400",

  // Scripts
  sh: "text-green-600 dark:text-green-400",
  bash: "text-green-600 dark:text-green-400",
  zsh: "text-green-600 dark:text-green-400",

  // Markdown
  md: "text-slate-500 dark:text-slate-400",
  mdx: "text-slate-500 dark:text-slate-400",

  // Assets
  svg: "text-purple-600 dark:text-purple-400",
  png: "text-pink-600 dark:text-pink-400",
  jpg: "text-pink-600 dark:text-pink-400",
  jpeg: "text-pink-600 dark:text-pink-400",
  avif: "text-pink-600 dark:text-pink-400",
  webp: "text-pink-600 dark:text-pink-400",

  // Fonts / misc
  woff: "text-muted-foreground",
  woff2: "text-muted-foreground",
  ttf: "text-muted-foreground",
  otf: "text-muted-foreground",
  txt: "text-muted-foreground",
  gitignore: "text-orange-500 dark:text-orange-400",
};

function FileTree({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("my-6 font-mono text-[15px]", className)} {...props} />
  );
}

function FileTreeFolder({
  name,
  defaultOpen = false,
  children,
}: {
  name: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const shouldReduce = useReducedMotion();

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      <CollapsiblePrimitive.Trigger className="group/folder flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none">
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          initial={false}
          transition={shouldReduce ? { duration: 0 } : SPRING_SHARP}
          className="flex shrink-0 items-center justify-center"
        >
          <ChevronRightIcon className="size-4 text-muted-foreground/70" />
        </motion.span>
        <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium text-foreground">{name}</span>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content forceMount>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={
            shouldReduce
              ? { duration: 0 }
              : {
                  height: SPRING_SMOOTH,
                  opacity: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }
          }
          style={{ overflow: "hidden", transform: "translateZ(0)" }}
        >
          <div className="ml-[19px] border-l border-border/60 py-0.5 pl-3">
            {children}
          </div>
        </motion.div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

function FileTreeFile({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const colorClass = FILE_COLORS[ext] ?? "text-muted-foreground";
  return (
    <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/40">
      <FileIcon className={cn("size-4 shrink-0", colorClass)} />
      <span className="truncate">{name}</span>
    </div>
  );
}

export { FileTree, FileTreeFolder, FileTreeFile };
