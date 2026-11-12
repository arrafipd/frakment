"use client";

import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import { motion } from "motion/react";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/site/popover";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useFeedback } from "@/hooks/use-feedback";
// NOTE: This component mirrors components/docs-sidebar.tsx.'s structure.
// Both render TOP_LEVEL_SECTIONS (flat) + tree.children grouped, filtered by
// EXCLUDED_SECTIONS. If you change one, change the other - or better, hoist
// the shared logic into a helper.
import { buildNavGroups, PAGES_NEW } from "@/lib/docs";
import { cn } from "@/lib/utils";

const MobileLink = ({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: LinkProps & {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const playClick = useFeedback({ sound: "click" });

  const handleClick = useCallback(() => {
    playClick();
    router.push(href.toString());
    onOpenChange?.(false);
  }, [router, href, onOpenChange, playClick]);

  return (
    <Link
      className={cn("text-2xl font-medium", className)}
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

const MobileNavGroup = ({
  label,
  pages,
  setOpen,
}: {
  label: React.ReactNode;
  pages: { url: string; name: React.ReactNode; isNew?: boolean }[];
  setOpen: (open: boolean) => void;
}) => {
  if (pages.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
      <div className="flex flex-col gap-3">
        {pages.map((page) => (
          <MobileLink href={page.url} key={page.url} onOpenChange={setOpen}>
            <span className="inline-flex items-center gap-2">
              {page.name}
              {page.isNew ? (
                <span
                  aria-label="New"
                  className="size-2 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
                />
              ) : null}
            </span>
          </MobileLink>
        ))}
      </div>
    </div>
  );
};

export const MobileNav = ({
  tree,
  className,
}: {
  tree: PageTreeRoot;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "size-8 touch-manipulation hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent",
            className
          )}
          size="icon"
          variant="ghost"
        >
          <div className="relative size-4">
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? 3 : 0 }}
              className="bg-foreground absolute left-0 block h-px w-4"
              initial={false}
              style={{ top: 4 }}
              transition={{
                rotate: {
                  delay: open ? 0.12 : 0,
                  duration: 0.15,
                  ease: "easeOut",
                },
                y: { delay: open ? 0 : 0.15, duration: 0.12, ease: "easeOut" },
              }}
            />
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? -5 : 0 }}
              className="bg-foreground absolute left-0 block h-px w-4"
              initial={false}
              style={{ top: 12 }}
              transition={{
                rotate: {
                  delay: open ? 0.12 : 0,
                  duration: 0.15,
                  ease: "easeOut",
                },
                y: { delay: open ? 0 : 0.15, duration: 0.12, ease: "easeOut" },
              }}
            />
          </div>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        alignOffset={-16}
        className="bg-background/90 no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto overscroll-contain rounded-none border-none p-0 shadow-none backdrop-blur"
        side="bottom"
        sideOffset={0}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground text-sm font-medium">
              Menu
            </div>
            <div className="flex flex-col gap-3">
              <MobileLink href={ROUTES.HOME} onOpenChange={setOpen}>
                Home
              </MobileLink>
            </div>
          </div>
          {buildNavGroups(tree).map((group) => (
            <MobileNavGroup
              key={group.label}
              label={group.label}
              pages={group.items.map((i) => ({
                isNew: PAGES_NEW.has(i.href),
                name: i.name,
                url: i.href,
              }))}
              setOpen={setOpen}
            />
          ))}
          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground text-sm font-medium">
              Support
            </div>
            <div className="flex flex-col gap-3">
              <MobileLink href={ROUTES.SPONSOR} onOpenChange={setOpen}>
                Support
              </MobileLink>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
