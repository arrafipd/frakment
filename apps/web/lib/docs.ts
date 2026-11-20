import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import { ROUTES } from "@/config/routes";
import type { PageTreeFolder } from "@/lib/page-tree";
import { getAllPagesFromFolder, getPagesFromFolder } from "@/lib/page-tree";
import { formatLabelFromSlug } from "@/lib/utils";

export const docsDir = `content${ROUTES.DOCS}`;

export const excludedSections = new Set([
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

export const sectionGroups: SectionGroup[] = [
  {
    label: "Get Started",
    sections: [
      { href: ROUTES.docsGettingStarted, name: "Introduction" },
      { href: ROUTES.docsInstallation, name: "Installation" },
      { href: ROUTES.docsComponentsJson, name: "components.json" },
    ],
  },
  {
    label: "Guides",
    sections: [
      { href: ROUTES.docsTheming, name: "Theming" },
      { href: ROUTES.docsTypography, name: "Typography" },
      { href: ROUTES.docsDarkMode, name: "Dark mode" },
      { href: ROUTES.docsAnimations, name: "Animations" },
    ],
  },
];

export const topLevelSections: TopLevelSection[] = sectionGroups.flatMap(
  (g) => g.sections
);

export const isComponentsFolder = (folder: PageTreeFolder) =>
  folder.$id === "components" || folder.name === "Components";

const titleOverrides: Record<string, string> = {
  json: "JSON",
  "qr-code": "QR Code",
};

export const formatTitleFromSlug = (slug: string): string =>
  titleOverrides[slug] ?? formatLabelFromSlug(slug);

export const homeContentRoute = `${ROUTES.llmsMd}/content.md`;
export const docsContentRoute = `${ROUTES.llmsMd}${ROUTES.DOCS}`;
export const docsImageRoute = `${ROUTES.OG}${ROUTES.DOCS}`;

export const pagesNew: ReadonlySet<string> = new Set([
  "/docs/composites/login-form",
  "/docs/composites/signup-form",
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
  const groups: NavGroup[] = sectionGroups.map((g) => ({
    items: g.sections.map((x) => ({ href: x.href, name: x.name })),
    label: g.label,
  }));
  const seen = new Set(groups.flatMap((g) => g.items.map((i) => i.href)));
  for (const item of tree.children) {
    if (item.type !== "folder") {
      continue;
    }
    if (excludedSections.has(item.$id ?? "")) {
      continue;
    }
    const pages = (
      isComponentsFolder(item)
        ? getAllPagesFromFolder(item)
            .filter((p) => p.url !== ROUTES.docsComponents)
            .filter((p) => !p.url.startsWith("/docs/components/native/"))
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

export function normalizeActivePath(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  return path
    .replace(/\/+$/u, "")
    .replace(/\/web\//gu, "/")
    .replace(/\/native\//gu, "/")
    .replace(/\/([^/]+)\/native$/u, "/$1");
}

export function isActiveDocPath(
  itemHref: string,
  currentPath: string | null | undefined
): boolean {
  if (!currentPath) {
    return false;
  }
  return normalizeActivePath(itemHref) === normalizeActivePath(currentPath);
}
