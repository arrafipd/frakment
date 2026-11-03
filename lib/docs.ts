import { ROUTES } from "@/constants/routes";
import type { PageTreeFolder } from "@/lib/page-tree";
import { formatLabelFromSlug } from "@/lib/utils";

export const DOCS_DIR = `content${ROUTES.DOCS}`;

export const EXCLUDED_SECTIONS = new Set([
  "installation",
  "(root)",
  "skills",
  "mcp",
  "changelog",
]);

export interface TopLevelSection {
  href: string;
  name: string;
}

// SINGLE SOURCE OF TRUTH for top-level docs sections.
// Used by docs-sidebar.tsx, command-menu.tsx, and (via navItems in
// site-header) mobile-nav.tsx. Add new sections here, not in the consumers.
export const TOP_LEVEL_SECTIONS: TopLevelSection[] = [
  { href: ROUTES.DOCS, name: "Introduction" },
  { href: ROUTES.DOCS_INSTALLATION, name: "Installation" },
  { href: ROUTES.DOCS_THEMING, name: "Theming" },
  { href: ROUTES.DOCS_COMPONENTS, name: "Components" },
  { href: ROUTES.DOCS_AI_ELEMENTS, name: "AI Elements" },
  { href: ROUTES.DOCS_SKILLS, name: "Skills" },
  { href: ROUTES.DOCS_MCP, name: "MCP" },
  { href: ROUTES.DOCS_CHANGELOG, name: "Changelog" },
  { href: ROUTES.DOCS_BRAND, name: "Brand" },
  { href: ROUTES.DOCS_LLMS, name: "llms.txt" },
];

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
  "/docs/components/card",
  "/docs/components/tooltip",
  "/docs/components/dropdown-menu",
  "/docs/components/toggle",
  "/docs/components/toggle-group",
  "/docs/components/checkbox",
  "/docs/components/label",
  "/docs/components/switch",
  "/docs/components/select",
  "/docs/ai-elements/message-scroller",
  "/docs/ai-elements/message",
  "/docs/ai-elements/bubble",
]);
