import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import { ROUTES } from "@/constants/routes";
import type { PageTreeFolder } from "@/lib/page-tree";
import { getAllPagesFromFolder, getPagesFromFolder } from "@/lib/page-tree";
import { formatLabelFromSlug } from "@/lib/utils";

export const DOCS_DIR = `content${ROUTES.DOCS}`;

export const EXCLUDED_SECTIONS = new Set([
  "getting-started",
  "guides",
  "skills",
  "mcp",
  "changelog",
]);

export interface TopLevelSection {
  href: string;
  name: string;
}

export interface SectionGroup {
  label: string;
  sections: TopLevelSection[];
}

// SINGLE SOURCE OF TRUTH for top-level docs sections.
// Used by docs-sidebar.tsx, command-menu.tsx, and (via navItems in
// site-header) mobile-nav.tsx. Add new sections here, not in the consumers.
export const SECTION_GROUPS: SectionGroup[] = [
  {
    label: "Get Started",
    sections: [
      { href: ROUTES.DOCS_GETTING_STARTED, name: "Introduction" },
      { href: ROUTES.DOCS_INSTALLATION, name: "Installation" },
      { href: ROUTES.DOCS_COMPONENTS_JSON, name: "components.json" },
    ],
  },
  {
    label: "Guides",
    sections: [
      { href: ROUTES.DOCS_THEMING, name: "Theming" },
      { href: ROUTES.DOCS_TYPOGRAPHY, name: "Typography" },
      { href: ROUTES.DOCS_DARK_MODE, name: "Dark mode" },
      { href: ROUTES.DOCS_ANIMATIONS, name: "Animations" },
    ],
  },
];

// Flat fallback for consumers that still expect a single array.
export const TOP_LEVEL_SECTIONS: TopLevelSection[] = SECTION_GROUPS.flatMap(
  (g) => g.sections
);

export const isComponentsFolder = (folder: PageTreeFolder) =>
  folder.$id === "components" || folder.name === "Components";

const TITLE_OVERRIDES: Record<string, string> = {
  json: "JSON",
  "qr-code": "QR Code",
};

export const formatTitleFromSlug = (slug: string): string =>
  TITLE_OVERRIDES[slug] ?? formatLabelFromSlug(slug);

export const homeContentRoute = `${ROUTES.LLMS_MD}/content.md`;
export const docsContentRoute = `${ROUTES.LLMS_MD}${ROUTES.DOCS}`;
export const docsImageRoute = `${ROUTES.OG}${ROUTES.DOCS}`;

// Pages marked "new" — get a blue dot in sidebar + mobile nav.
// Add the URL here when releasing a new component or page; remove once it
// graduates from "new". Single source of truth for the "new" indicator.
export const PAGES_NEW: ReadonlySet<string> = new Set([
  "/docs/modules/holo-card",
]);

export interface NavItem {
  href: string;
  name: string;
}
export interface NavGroup {
  items: NavItem[];
  label: string;
}
export function buildNavGroups(tree: PageTreeRoot): NavGroup[] {
  const groups: NavGroup[] = SECTION_GROUPS.map((g) => ({
    items: g.sections.map((x) => ({ href: x.href, name: x.name })),
    label: g.label,
  }));
  const seen = new Set(groups.flatMap((g) => g.items.map((i) => i.href)));
  for (const item of tree.children) {
    if (item.type !== "folder") {
      continue;
    }
    if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
      continue;
    }
    const pages = (
      isComponentsFolder(item)
        ? getAllPagesFromFolder(item)
            .filter((p) => p.url !== ROUTES.DOCS_COMPONENTS)
            .filter((p) => !p.url.startsWith("/docs/components/expo/"))
            .map((p) => ({
              ...p,
              url: p.url.replace("/docs/components/web/", "/docs/components/"),
            }))
        : getPagesFromFolder(item)
    )
      .map((p) => ({
        href: p.url,
        name:
          typeof p.name === "string"
            ? p.name
            : formatTitleFromSlug(p.url.split("/").pop() ?? ""),
      }))
      .filter((p) => {
        if (seen.has(p.href)) {
          return false;
        }
        seen.add(p.href);
        return true;
      });
    if (pages.length > 0) {
      groups.push({
        items: pages,
        label:
          typeof item.name === "string"
            ? item.name
            : formatTitleFromSlug(
                (item.index?.url ?? "").split("/").pop() ?? ""
              ),
      });
    }
  }
  const resources = groups.find((g) => g.label === "Resources");
  if (resources && !resources.items.some((i) => i.href === "/docs/changelog")) {
    resources.items.push({ href: "/docs/changelog", name: "Changelog" });
  }
  return groups;
}
