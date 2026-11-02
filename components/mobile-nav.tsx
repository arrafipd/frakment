"use client";

import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import { motion } from "motion/react";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/constants/routes";
import { useFeedback } from "@/hooks/use-feedback";
// NOTE: This component mirrors components/docs-sidebar.tsx.'s structure.
// Both render TOP_LEVEL_SECTIONS (flat) + tree.children grouped, filtered by
// EXCLUDED_SECTIONS. If you change one, change the other - or better, hoist
// the shared logic into a helper.
import {
  EXCLUDED_SECTIONS,
  isComponentsFolder,
  TOP_LEVEL_SECTIONS,
} from "@/lib/docs";
import { getAllPagesFromFolder, getPagesFromFolder } from "@/lib/page-tree";
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
      href={href}
      onClick={handleClick}
      className={cn("text-2xl font-medium", className)}
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
  pages: { url: string; name: React.ReactNode }[];
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
          <MobileLink key={page.url} href={page.url} onOpenChange={setOpen}>
            {page.name}
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 touch-manipulation hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent",
            className
          )}
        >
          <div className="relative size-4">
            <motion.span
              className="bg-foreground absolute left-0 block h-px w-4"
              style={{ top: 4 }}
              initial={false}
              animate={{ y: open ? 3 : 0, rotate: open ? -45 : 0 }}
              transition={{
                y: { duration: 0.12, ease: "easeOut", delay: open ? 0 : 0.15 },
                rotate: {
                  duration: 0.15,
                  ease: "easeOut",
                  delay: open ? 0.12 : 0,
                },
              }}
            />
            <motion.span
              className="bg-foreground absolute left-0 block h-px w-4"
              style={{ top: 12 }}
              initial={false}
              animate={{ y: open ? -5 : 0, rotate: open ? 45 : 0 }}
              transition={{
                y: { duration: 0.12, ease: "easeOut", delay: open ? 0 : 0.15 },
                rotate: {
                  duration: 0.15,
                  ease: "easeOut",
                  delay: open ? 0.12 : 0,
                },
              }}
            />
          </div>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background/90 no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto overscroll-contain rounded-none border-none p-0 shadow-none backdrop-blur"
        align="start"
        side="bottom"
        alignOffset={-16}
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
              {TOP_LEVEL_SECTIONS.map((item) => (
                <MobileLink
                  key={item.href}
                  href={item.href}
                  onOpenChange={setOpen}
                >
                  {item.name}
                </MobileLink>
              ))}
            </div>
          </div>
          {tree.children.map((item) => {
            if (item.type !== "folder") {
              return null;
            }
            if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
              return null;
            }

            const pages = isComponentsFolder(item)
              ? getAllPagesFromFolder(item).filter(
                  (page) => page.url !== ROUTES.DOCS_COMPONENTS
                )
              : getPagesFromFolder(item);

            return (
              <MobileNavGroup
                key={item.$id}
                label={item.name}
                pages={pages}
                setOpen={setOpen}
              />
            );
          })}
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
