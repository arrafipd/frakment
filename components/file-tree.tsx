"use client";

import { motion, useReducedMotion } from "motion/react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import * as React from "react";

import {
  AstroBrandIcon,
  BashBrandIcon,
  BunIcon,
  CssBrandIcon,
  CssIcon,
  HtmlBrandIcon,
  JavascriptBrandIcon,
  JsonIcon,
  MarkdownDocIcon,
  NextjsBrandIcon,
  NpmIcon,
  PnpmIcon,
  PostcssBrandIcon,
  ReactBrandIcon,
  SvelteBrandIcon,
  TailwindBrandIcon,
  TomlBrandIcon,
  TsIcon,
  ViteBrandIcon,
  VueBrandIcon,
  YamlBrandIcon,
  YarnIcon,
} from "@/components/icons";
import {
  ChatCentered,
  ChevronRightIcon,
  CircleIcon,
  CodeIcon,
  FileIcon,
  FolderIcon,
  GitBranchIcon,
  PackageIcon,
  SquareDashedIcon,
  TerminalIcon,
  TreeStructure,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

type FileIconComponent = React.ComponentType<{ className?: string }>;

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
  avif: "text-pink-600 dark:text-pink-400",
  env: "text-yellow-600 dark:text-yellow-400",
  gitignore: "text-orange-500 dark:text-orange-400",
  jpeg: "text-pink-600 dark:text-pink-400",
  jpg: "text-pink-600 dark:text-pink-400",
  lock: "text-muted-foreground",
  otf: "text-muted-foreground",
  png: "text-pink-600 dark:text-pink-400",
  svg: "text-purple-600 dark:text-purple-400",
  ttf: "text-muted-foreground",
  txt: "text-muted-foreground",
  webp: "text-pink-600 dark:text-pink-400",
  woff: "text-muted-foreground",
  woff2: "text-muted-foreground",
};

const EXT_ICONS: Record<string, FileIconComponent> = {
  astro: AstroBrandIcon,
  bash: BashBrandIcon,
  cjs: JavascriptBrandIcon,
  css: CssIcon,
  htm: HtmlBrandIcon,
  html: HtmlBrandIcon,
  js: JavascriptBrandIcon,
  json: JsonIcon,
  jsonc: JsonIcon,
  jsx: ReactBrandIcon,
  md: MarkdownDocIcon,
  mdx: MarkdownDocIcon,
  mjs: JavascriptBrandIcon,
  sass: CssBrandIcon,
  scss: CssBrandIcon,
  sh: BashBrandIcon,
  svelte: SvelteBrandIcon,
  toml: TomlBrandIcon,
  ts: TsIcon,
  tsx: TsIcon,
  vue: VueBrandIcon,
  yaml: YamlBrandIcon,
  yml: YamlBrandIcon,
  zsh: BashBrandIcon,
};

const BRAND_ICONS: Record<string, FileIconComponent> = {
  "astro.config.js": AstroBrandIcon,
  "astro.config.mjs": AstroBrandIcon,
  "astro.config.ts": AstroBrandIcon,
  "bun.lockb": BunIcon,
  "next.config.js": NextjsBrandIcon,
  "next.config.mjs": NextjsBrandIcon,
  "next.config.ts": NextjsBrandIcon,
  "package-lock.json": NpmIcon,
  "package.json": NpmIcon,
  "pnpm-lock.yaml": PnpmIcon,
  "pnpm-workspace.yaml": PnpmIcon,
  "postcss.config.js": PostcssBrandIcon,
  "postcss.config.mjs": PostcssBrandIcon,
  "tailwind.config.js": TailwindBrandIcon,
  "tailwind.config.ts": TailwindBrandIcon,
  "tsconfig.json": TsIcon,
  "vite.config.js": ViteBrandIcon,
  "vite.config.mjs": ViteBrandIcon,
  "vite.config.ts": ViteBrandIcon,
  "yarn.lock": YarnIcon,
};

const CUSTOM_ICONS: Record<string, FileIconComponent> = {
  chat: ChatCentered,
  circle: CircleIcon,
  code: CodeIcon,
  component: PackageIcon,
  file: FileIcon,
  folder: FolderIcon,
  git: GitBranchIcon,
  package: PackageIcon,
  slot: SquareDashedIcon,
  terminal: TerminalIcon,
  tree: TreeStructure,
};

function getFileIcon(name: string, iconOverride?: string): FileIconComponent {
  if (iconOverride && CUSTOM_ICONS[iconOverride]) {
    return CUSTOM_ICONS[iconOverride];
  }
  if (BRAND_ICONS[name]) {
    return BRAND_ICONS[name];
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (EXT_ICONS[ext]) {
    return EXT_ICONS[ext];
  }
  return FileIcon;
}

function FileTree({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("my-6 font-mono text-[15px]", className)} {...props} />
  );
}

function FileTreeFolder({
  name,
  icon,
  defaultOpen = false,
  children,
}: {
  name: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const shouldReduce = useReducedMotion();
  const FolderIconResolved =
    icon && CUSTOM_ICONS[icon] ? CUSTOM_ICONS[icon] : FolderIcon;

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
        <FolderIconResolved className="text-muted-foreground size-4 shrink-0" />
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

function FileTreeFile({ name, icon }: { name: string; icon?: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const Icon = getFileIcon(name, icon);
  const isGeneric = !(icon || BRAND_ICONS[name] || EXT_ICONS[ext]);
  const colorClass = isGeneric
    ? (FILE_COLORS[ext] ?? "text-muted-foreground")
    : "text-muted-foreground";
  return (
    <div className="text-muted-foreground hover:bg-muted/40 flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors">
      <Icon className={cn("size-4 shrink-0", colorClass)} />
      <span className="truncate">{name}</span>
    </div>
  );
}

export { FileTree, FileTreeFile, FileTreeFolder };
