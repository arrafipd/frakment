"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/site/sidebar";
// NOTE: This component mirrors components/mobile-nav.tsx.'s structure.
// Both render TOP_LEVEL_SECTIONS (flat) + tree.children grouped, filtered by
// EXCLUDED_SECTIONS. If you change one, change the other — or better, hoist
// the shared logic into a helper.
import { buildNavGroups, isActiveDocPath, PAGES_NEW } from "@/lib/docs";
import type { source } from "@/lib/source";

const MENU_BUTTON_CLS =
  "relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48";

const SidebarPageGroup = ({
  label,
  pages,
  pathname,
}: {
  label: React.ReactNode;
  pages: { url: string; name: React.ReactNode; isNew?: boolean }[];
  pathname: string;
}) => {
  if (pages.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-medium">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {pages.map((page) => (
            <SidebarMenuItem key={page.url}>
              <SidebarMenuButton
                asChild
                className={MENU_BUTTON_CLS}
                isActive={isActiveDocPath(page.url, pathname)}
              >
                <Link className="flex items-center gap-1.5" href={page.url}>
                  <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                  {page.name}
                  {page.isNew ? (
                    <span
                      aria-label="New"
                      className="size-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
                    />
                  ) : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export const DocsSidebar = ({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & { tree: typeof source.pageTree }) => {
  const pathname = usePathname();

  return (
    <Sidebar
      className="text-sidebar-foreground sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] flex-col overscroll-none bg-transparent [--sidebar-menu-width:--spacing(48)] lg:flex"
      collapsible="none"
      {...props}
    >
      <div className="h-9" />
      <div className="from-background via-background/80 to-background/50 absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b blur-xs" />
      <div className="via-border absolute top-12 right-2 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent to-transparent lg:flex" />
      <SidebarContent className="no-scrollbar mx-auto w-(--sidebar-menu-width) overflow-x-hidden px-2">
        <div className="pt-6" />
        {buildNavGroups(tree).map((group) => (
          <SidebarPageGroup
            key={group.label}
            label={group.label}
            pages={group.items.map((i) => ({
              isNew: PAGES_NEW.has(i.href),
              name: i.name,
              url: i.href,
            }))}
            pathname={pathname}
          />
        ))}
        <div className="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
};
