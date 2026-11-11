"use client";

import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useFeedback } from "@/hooks/use-feedback";
import { useIsMac } from "@/hooks/use-is-mac";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import { usePackageManager } from "@/hooks/use-package-manager";
import { buildNavGroups } from "@/lib/docs";
import { trackEvent } from "@/lib/events";
import {
  ArrowRightIcon,
  CircleDashedIcon,
  CornerDownLeftIcon,
  SearchIcon,
  SquareDashedIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

type DocUrlKind =
  | { kind: "theme"; slug: string }
  | { kind: "component"; slug: string }
  | { kind: "template"; slug: string }
  | { kind: "page" };

const GROUP_HEADING_CLS =
  "!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1";

const parseDocPageUrl = (url: string): DocUrlKind => {
  const parts = url.split("/").filter(Boolean);
  const themesIdx = parts.indexOf("themes");
  if (themesIdx !== -1 && parts[themesIdx + 1]) {
    return { kind: "theme", slug: parts[themesIdx + 1] };
  }
  const componentsIdx = parts.indexOf("components");
  if (componentsIdx !== -1 && parts[componentsIdx + 1]) {
    return { kind: "component", slug: parts.at(-1) ?? "" };
  }
  const templatesIdx = parts.indexOf("templates");
  if (templatesIdx !== -1 && parts[templatesIdx + 1]) {
    return { kind: "template", slug: parts.at(-1) ?? "" };
  }
  return { kind: "page" };
};

const searchKeywordsFromUrl = (url: string) => {
  const segments = url.split("/").filter(Boolean);
  return segments.flatMap((segment) =>
    segment.includes("-") ? [segment, ...segment.split("-")] : [segment]
  );
};

const buildDocPageKeywords = (
  parsed: DocUrlKind,
  url: string,
  breadcrumb: string[]
): string[] => [
  ...(parsed.kind === "page" ? [] : [parsed.kind]),
  ...breadcrumb.filter(Boolean).flatMap((s) => [s, s.toLowerCase()]),
  ...searchKeywordsFromUrl(url),
];

const DocPageLeadingIcon = ({ parsed }: { parsed: DocUrlKind }) => {
  // if (parsed.kind === "theme") {
  //   const color = themePrimaryBySlug[parsed.slug];
  //   return (
  //     <span
  //       className="border-border/60 size-4 shrink-0 rounded-sm border"
  //       style={color ? { backgroundColor: color } : undefined}
  //       aria-hidden
  //     />
  //   );
  // }
  if (parsed.kind === "component") {
    return <CircleDashedIcon />;
  }
  if (parsed.kind === "template") {
    return <SquareDashedIcon />;
  }
  return <ArrowRightIcon />;
};

const CommandMenuItem = ({
  children,
  className,
  onHighlight,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  onHighlight?: () => void;
  "data-selected"?: string;
  "aria-selected"?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useMutationObserver(ref, (mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected" &&
        ref.current?.getAttribute("aria-selected") === "true"
      ) {
        onHighlight?.();
      }
    }
  });

  return (
    <CommandItem
      className={cn(
        "data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-9 rounded-md border border-transparent px-3! font-medium",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </CommandItem>
  );
};

export const CommandMenu = ({
  blocks,
  tree,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  blocks?: { name: string; description: string; categories: string[] }[];
  tree: PageTreeRoot;
}) => {
  const router = useRouter();
  const isMac = useIsMac();
  const [packageManager] = usePackageManager();
  const [open, setOpen] = useState(false);
  const [showGoToPage, setShowGoToPage] = useState(false);
  const [copyPayload, setCopyPayload] = useState("");
  const copyFeedback = useFeedback({ sound: "copy" });

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      if (copyPayload) {
        trackEvent({
          name: "copy_npm_command",
          properties: { command: copyPayload, pm: packageManager },
        });
      }
    },
  });

  const navGroups = useMemo(() => buildNavGroups(tree), [tree]);

  const handleDocPageHighlight = useCallback(
    (item: { url: string; name?: string }) => {
      setShowGoToPage(true);
      const parsed = parseDocPageUrl(item.url);
      if (parsed.kind === "theme") {
        setCopyPayload(
          `${packageManager} frakment@latest add theme-${parsed.slug}`
        );
        return;
      }
      if (parsed.kind === "component" || parsed.kind === "template") {
        setCopyPayload(`${packageManager} frakment@latest add ${parsed.slug}`);
        return;
      }
      setCopyPayload("");
    },
    [packageManager]
  );

  const handleBlockHighlight = useCallback(
    (block: { name: string; description: string; categories: string[] }) => {
      setShowGoToPage(true);
      setCopyPayload(`${packageManager} frakment@latest add ${block.name}`);
    },
    [packageManager]
  );

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleOpenClick = useCallback(() => setOpen(true), []);

  const handleFilter = useCallback(
    (value: string, search: string, keywords?: string[]) => {
      const extendValue = `${value} ${keywords?.join(" ") || ""}`;
      if (extendValue.toLowerCase().includes(search.toLowerCase())) {
        return 1;
      }
      return 0;
    },
    []
  );

  const renderDocPageItem = (
    title: string,
    url: string,
    breadcrumb: string[]
  ) => {
    const parsed = parseDocPageUrl(url);
    return (
      <CommandMenuItem
        key={url}
        keywords={buildDocPageKeywords(parsed, url, breadcrumb)}
        onHighlight={() => handleDocPageHighlight({ name: title, url })}
        onSelect={() => runCommand(() => router.push(url))}
        value={[...breadcrumb, title].filter(Boolean).join(" ")}
      >
        <DocPageLeadingIcon parsed={parsed} />
        {title}
      </CommandMenuItem>
    );
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            const metaKeyPressed = e.metaKey ? "cmd+k" : "ctrl+k";
            trackEvent({
              name: "open_command_menu",
              properties: {
                key: e.key === "/" ? "/" : metaKeyPressed,
                method: "keyboard",
              },
            });
          }
          return !prev;
        });
      }

      if (
        e.key === "c" &&
        (e.metaKey || e.ctrlKey) &&
        copyPayload.includes("frakment add")
      ) {
        runCommand(() => {
          copyFeedback();
          copyToClipboard(copyPayload);
        });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [copyPayload, runCommand, copyToClipboard, copyFeedback]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          aria-label="Search documentation"
          className={cn(
            "text-surface-foreground/60 hover:bg-accent md:bg-surface dark:md:bg-card relative size-8 justify-center p-0 font-normal shadow-none md:h-8 md:w-40 md:justify-start md:gap-2 md:pl-2.5 lg:w-56 xl:w-64"
          )}
          onClick={handleOpenClick}
          variant="ghost"
          {...props}
        >
          <SearchIcon className="text-foreground md:text-surface-foreground/40 size-4.5 shrink-0 md:size-3.5" />
          <span className="text-surface-foreground/40 hidden lg:inline-flex">
            Search documentation...
          </span>
          <span className="text-surface-foreground/40 hidden md:inline-flex lg:hidden">
            Search...
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="rounded-xl border border-neutral-200 bg-white p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-900 dark:ring-neutral-800"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search documentation...</DialogTitle>
          <DialogDescription>Search for a command to run...</DialogDescription>
        </DialogHeader>
        <Command
          className="**:data-[slot=command-input-wrapper]:bg-sidebar/80 **:data-[slot=command-input-wrapper]:border-border rounded-none bg-transparent **:data-[slot=command-input]:h-9! **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9! **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border **:data-[slot=command-input-wrapper]:ring-0"
          filter={handleFilter}
        >
          <CommandInput placeholder="Search documentation..." />
          <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
            <CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
              No results found.
            </CommandEmpty>
            {navGroups.map((group) => (
              <CommandGroup
                className={GROUP_HEADING_CLS}
                heading={group.label}
                key={group.label}
              >
                {group.items.map((item) =>
                  renderDocPageItem(item.name, item.href, [group.label])
                )}
              </CommandGroup>
            ))}
            {blocks?.length ? (
              <CommandGroup
                className="p-0! **:[[cmdk-group-heading]]:p-3!"
                heading="Blocks"
              >
                {blocks.map((block) => (
                  <CommandMenuItem
                    key={block.name}
                    keywords={[
                      "block",
                      block.name,
                      block.description,
                      ...block.categories,
                    ]}
                    onHighlight={() => handleBlockHighlight(block)}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(
                          `/blocks/${block.categories[0]}#${block.name}`
                        )
                      )
                    }
                    value={block.name}
                  >
                    <SquareDashedIcon />
                    {block.description}
                    <span className="text-muted-foreground ml-auto font-mono text-xs font-normal tabular-nums">
                      {block.name}
                    </span>
                  </CommandMenuItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
        <div className="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 overflow-hidden rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800">
          <div className="flex shrink-0 items-center gap-2">
            <Kbd className="shrink-0">
              <CornerDownLeftIcon />
            </Kbd>{" "}
            {showGoToPage ? (
              <span className="min-w-0 truncate">Go to Page</span>
            ) : null}
          </div>
          {copyPayload && (
            <>
              <Separator className="h-4!" orientation="vertical" />
              <div className="flex min-w-0 items-center gap-1">
                <Kbd className="shrink-0">{isMac ? "âŒ˜" : "Ctrl"}</Kbd>
                <Kbd className="shrink-0">C</Kbd>
                <span className="min-w-0 truncate">{copyPayload}</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
