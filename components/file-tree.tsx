"use client";

import { motion, useReducedMotion } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import * as React from "react";

import { ChevronRightIcon, FileIcon, FolderIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const SPRING_SMOOTH = {
  damping: 36,
  mass: 0.9,
  stiffness: 320,
  type: "spring" as const,
};

const SPRING_SHARP = {
  damping: 32,
  mass: 0.7,
  stiffness: 420,
  type: "spring" as const,
};

const FILE_COLORS: Record<string, string> = {
  // Frameworks
  astro: "text-orange-500 dark:text-orange-400",
  avif: "text-pink-600 dark:text-pink-400",
  bash: "text-green-600 dark:text-green-400",
  cjs: "text-amber-500 dark:text-amber-400",

  // Styles
  css: "text-sky-600 dark:text-sky-400",
  env: "text-yellow-600 dark:text-yellow-400",
  gitignore: "text-orange-500 dark:text-orange-400",
  html: "text-orange-600 dark:text-orange-400",
  jpeg: "text-pink-600 dark:text-pink-400",
  jpg: "text-pink-600 dark:text-pink-400",
  js: "text-amber-500 dark:text-amber-400",
  // Config / data
  json: "text-amber-600 dark:text-amber-400",
  jsonc: "text-amber-600 dark:text-amber-400",
  jsx: "text-amber-500 dark:text-amber-400",
  lock: "text-muted-foreground",

  // Markdown
  md: "text-slate-500 dark:text-slate-400",
  mdx: "text-slate-500 dark:text-slate-400",
  mjs: "text-amber-500 dark:text-amber-400",
  otf: "text-muted-foreground",
  png: "text-pink-600 dark:text-pink-400",
  sass: "text-pink-600 dark:text-pink-400",
  scss: "text-pink-600 dark:text-pink-400",

  // Scripts
  sh: "text-green-600 dark:text-green-400",
  svelte: "text-orange-600 dark:text-orange-400",

  // Assets
  svg: "text-purple-600 dark:text-purple-400",
  toml: "text-red-600 dark:text-red-400",

  // Code
  ts: "text-blue-600 dark:text-blue-400",
  tsx: "text-blue-600 dark:text-blue-400",
  ttf: "text-muted-foreground",
  txt: "text-muted-foreground",
  vue: "text-emerald-600 dark:text-emerald-400",
  webp: "text-pink-600 dark:text-pink-400",

  // Fonts / misc
  woff: "text-muted-foreground",
  woff2: "text-muted-foreground",
  yaml: "text-amber-600 dark:text-amber-400",
  yml: "text-amber-600 dark:text-amber-400",
  zsh: "text-green-600 dark:text-green-400",
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
    <CollapsiblePrimitive.Root onOpenChange={setOpen} open={open}>
      <CollapsiblePrimitive.Trigger className="group/folder hover:bg-muted/40 focus-visible:bg-muted/40 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-none">
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          className="flex shrink-0 items-center justify-center"
          initial={false}
          transition={shouldReduce ? { duration: 0 } : SPRING_SHARP}
        >
          <ChevronRightIcon className="text-muted-foreground/70 size-4" />
        </motion.span>
        <FolderIcon className="text-muted-foreground size-4 shrink-0" />
        <span className="text-foreground truncate font-medium">{name}</span>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content forceMount>
        <motion.div
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          initial={false}
          style={{ overflow: "hidden", transform: "translateZ(0)" }}
          transition={
            shouldReduce
              ? { duration: 0 }
              : {
                  height: SPRING_SMOOTH,
                  opacity: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }
          }
        >
          <div className="border-border/60 ml-[19px] border-l py-0.5 pl-3">
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
    <div className="text-muted-foreground hover:bg-muted/40 flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors">
      <FileIcon className={cn("size-4 shrink-0", colorClass)} />
      <span className="truncate">{name}</span>
    </div>
  );
}

export { FileTree, FileTreeFile, FileTreeFolder };
