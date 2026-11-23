"use client";

import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/site/popover";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useFeedback } from "@/hooks/use-feedback";

import {
  buildNavGroups,
  isActiveDocPath,
  normalizeActivePath,
  pagesNew,
} from "@/lib/docs";
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
  pathname,
}: {
  label: React.ReactNode;
  pages: { url: string; name: React.ReactNode; isNew?: boolean }[];
  setOpen: (open: boolean) => void;
  pathname: string;
}) => {
  if (pages.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
      <div className="flex flex-col gap-3">
        {pages.map((page) => (
          <MobileLink
            className={
              isActiveDocPath(page.url, pathname)
                ? "text-primary font-semibold"
                : undefined
            }
            href={page.url}
            key={page.url}
            onOpenChange={setOpen}
          >
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
  const pathname = usePathname();
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
      <PopoverTrigger
        as={Button}
        className={cn(
          "size-8 touch-manipulation hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent",
          className
        )}
        size="icon"
        variant="ghost"
      >
        <div className="relative size-4">
          <span
            className={cn(
              "bg-foreground absolute left-0 block h-px w-4 transition-all duration-150 ease-out motion-reduce:transition-none",
              open
                ? "translate-y-[3px] rotate-[-45deg]"
                : "translate-y-0 rotate-0"
            )}
            style={{ top: 4 }}
          />
          <span
            className={cn(
              "bg-foreground absolute left-0 block h-px w-4 transition-all duration-150 ease-out motion-reduce:transition-none",
              open ? "-translate-y-[5px] rotate-45" : "translate-y-0 rotate-0"
            )}
            style={{ top: 12 }}
          />
        </div>
        <span className="sr-only">Toggle Menu</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        alignOffset={-16}
        className="bg-background/90 no-scrollbar h-[calc(100dvh-4rem)] w-screen max-w-full overflow-y-auto overscroll-contain rounded-none border-none p-0 shadow-none backdrop-blur"
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
                isNew: pagesNew.has(normalizeActivePath(i.href)),
                name: i.name,
                url: i.href,
              }))}
              pathname={pathname}
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
