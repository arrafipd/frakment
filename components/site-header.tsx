import Link from "next/link";
import { FrakmentMark } from "@/components/brand/frakment-mark";
import { BrandContextMenu } from "@/components/brand-context-menu";
import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { NavItemGithub } from "@/components/nav-item-github";
import { SiteButton } from "@/components/site/button";
import { SponsorLink } from "@/components/sponsor-link";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

const navItems = [
  { href: ROUTES.DOCS, label: "Docs" },
  { href: ROUTES.DOCS_COMPONENTS, label: "Components" },
  { href: ROUTES.DOCS_AI_ELEMENTS, label: "AI Elements" },
  { href: ROUTES.DOCS_MODULES, label: "Modules" },
];

export const SiteHeader = () => (
  <header
    className="bg-background sticky top-0 z-50 w-full"
    style={{ viewTransitionName: "site-header" }}
  >
    <div className="container-wrapper 3xl:fixed:px-0 px-6">
      <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2">
        <BrandContextMenu>
          <SiteButton
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
          </SiteButton>
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
