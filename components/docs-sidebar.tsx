"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import type { TopLevelSection } from "@/lib/docs";
// NOTE: This component mirrors components/mobile-nav.tsx.'s structure.
// Both render TOP_LEVEL_SECTIONS (flat) + tree.children grouped, filtered by
// EXCLUDED_SECTIONS. If you change one, change the other — or better, hoist
// the shared logic into a helper.
import {
  EXCLUDED_SECTIONS,
  isComponentsFolder,
  TOP_LEVEL_SECTIONS,
} from "@/lib/docs";
import { getAllPagesFromFolder, getPagesFromFolder } from "@/lib/page-tree";
import type { source } from "@/lib/source";

const MENU_BUTTON_CLS =
  "relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48";

const SidebarPageGroup = ({
  label,
  pages,
  pathname,
}: {
  label: React.ReactNode;
  pages: { url: string; name: React.ReactNode }[];
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
                isActive={page.url === pathname}
              >
                <Link href={page.url}>
                  <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                  {page.name}
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
  const sections = useMemo<TopLevelSection[]>(() => {
    const base: TopLevelSection[] = [...TOP_LEVEL_SECTIONS];
    const shownHrefs = new Set(base.map((s) => s.href));

    for (const item of tree.children) {
      if (item.type !== "folder") {
        continue;
      }
      if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
        continue;
      }
      if (!item.index) {
        continue;
      }
      if (shownHrefs.has(item.index.url)) {
        continue;
      }

      const pages = getPagesFromFolder(item);
      const realChildren = pages.filter((p) => p.url !== item.index?.url);
      if (realChildren.length === 0) {
        base.push({
          href: item.index.url,
          name: typeof item.name === "string" ? item.name : String(item.name),
        });
      }
    }

    return base;
  }, [tree]);

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
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            Sections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map(({ name, href }) => (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton
                    asChild
                    className={MENU_BUTTON_CLS}
                    isActive={
                      href === ROUTES.DOCS
                        ? pathname === href
                        : pathname.startsWith(href)
                    }
                  >
                    <Link href={href}>
                      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                      {name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
            <SidebarPageGroup
              key={item.$id}
              label={item.name}
              pages={pages}
              pathname={pathname}
            />
          );
        })}
        <div className="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
};
