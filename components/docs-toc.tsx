"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFeedback } from "@/hooks/use-feedback";
import { MenuIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const headingById = (id: string): Element | null =>
  document.querySelector(`#${CSS.escape(id)}`);

const useActiveItem = (itemIds: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    for (const id of itemIds ?? []) {
      if (!id) {
        continue;
      }
      const element = headingById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        if (!id) {
          continue;
        }
        const element = headingById(id);
        if (element) {
          observer.unobserve(element);
        }
      }
    };
  }, [itemIds]);

  return activeId;
};

export const DocsTableOfContents = ({
  toc,
  variant = "list",
  className,
}: {
  toc: {
    title?: React.ReactNode;
    url: string;
    depth: number;
  }[];
  variant?: "dropdown" | "list";
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);
  const itemIds = useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc]
  );
  const activeHeading = useActiveItem(itemIds);
  const playTick = useFeedback({ sound: "tick" });

  if (!toc?.length) {
    return null;
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn("h-8 md:h-7", className)}
            size="sm"
            variant="outline"
          >
            <MenuIcon /> On This Page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="no-scrollbar max-h-[70svh]"
        >
          {toc.map((item) => (
            <DropdownMenuItem
              asChild
              className="data-[depth=3]:pl-6 data-[depth=4]:pl-8"
              data-depth={item.depth}
              key={item.url}
              onClick={handleClose}
            >
              <a href={item.url}>{item.title}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 p-4 pt-0 text-sm", className)}>
      <p className="text-muted-foreground bg-background sticky top-0 h-6 text-xs">
        On This Page
      </p>
      {toc.map((item) => (
        <a
          className="text-muted-foreground hover:text-foreground data-[active=true]:text-foreground text-[0.8rem] no-underline transition-colors data-[active=true]:font-medium data-[depth=3]:pl-4 data-[depth=4]:pl-6"
          data-active={item.url === `#${activeHeading}`}
          data-depth={item.depth}
          href={item.url}
          key={item.url}
          onClick={playTick}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
};
