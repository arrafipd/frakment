import Link from "next/link";
import { FrakmentMark } from "@/components/brand/frakment-mark";
import { BrandContextMenu } from "@/components/brand-context-menu";
import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { NavItemGithub } from "@/components/nav-item-github";
import { SponsorLink } from "@/components/sponsor-link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getPagesFromFolder } from "@/lib/page-tree";
import { source } from "@/lib/source";

const navItems = [
  { href: ROUTES.DOCS, label: "Docs" },
  ...source.pageTree.children
    .filter((item) => item.type === "folder")
    .flatMap((item) => {
      const [firstPage] = getPagesFromFolder(item);
      if (!firstPage) {
        return [];
      }

      return [
        {
          href: firstPage.url,
          label: typeof item.name === "string" ? item.name : String(item.name),
        },
      ];
    }),
].filter(
  (item, index, items) =>
    items.findIndex((candidate) => candidate.href === item.href) === index
);

export const SiteHeader = () => (
  <header
    className="bg-background sticky top-0 z-50 w-full"
    style={{ viewTransitionName: "site-header" }}
  >
    <div className="container-wrapper 3xl:fixed:px-0 px-6">
      <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2">
        <BrandContextMenu>
          <Button
            asChild
            className="text-foreground -ml-1.5 flex size-8 md:ml-0"
            size="icon"
            variant="ghost"
          >
            <Link
              className="text-foreground"
              href={ROUTES.HOME}
              transitionTypes={["nav-back"]}
            >
              <FrakmentMark className="size-5" />
              <span className="sr-only">{SITE.NAME}</span>
            </Link>
          </Button>
        </BrandContextMenu>
        <MainNav className="hidden lg:flex" items={navItems} />
        <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
          <NavItemGithub />
          <div className="w-auto flex-none md:order-first">
            <CommandMenu tree={source.pageTree} />
          </div>
          <div className="hidden md:flex md:items-center md:gap-2">
            <SponsorLink />
            <ModeSwitcher />
          </div>
          <MobileNav
            className="-mr-1.5 flex md:mr-0 lg:hidden"
            tree={source.pageTree}
          />
        </div>
      </div>
    </div>
  </header>
);
