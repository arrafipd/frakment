import { llms } from "fumadocs-core/source";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { source } from "@/lib/source";

export const revalidate = false;

const documentationIndex = (base: string) =>
  llms(source)
    .index()
    .replace(/^#\s+(.+)$/mu, "## $1")
    .replaceAll(
      /\]\((\/docs(?:\/[^)#\s]+)?)(#[^)]+)?\)/gu,
      (_, pathname, hash = "") => `](${base}${pathname}.md${hash})`
    )
    .trim();

const docsIndex = (origin: string) => {
  const base = origin.replace(/\/$/u, "");

  return `# ${SITE.NAME}

> ${SITE.DESCRIPTION.LONG} Use this index to discover the available documentation pages, markdown mirrors, and registry resources before browsing.

${documentationIndex(base)}

## Machine-readable Resources

- [Full documentation](${base}${ROUTES.LLMS_FULL}): All documentation pages in a single markdown file.
- [Homepage markdown](${base}${ROUTES.LLMS_MD}/content.md): Homepage content in markdown.
- [OpenAPI description](${base}${ROUTES.OPENAPI}): OpenAPI 3.1 spec for the Frakment registry.
- [API catalog](${base}${ROUTES.API_CATALOG}): RFC 9727 API catalog for the Frakment registry.
- [Agent skill](${base}${ROUTES.AGENT_SKILLS_SITE_SKILL}): Site-wide agent skill with usage instructions.
- [Frakment MCP server documentation](${LINK.FRAKMENT_MCP_DOCS}): Documentation for the Frakment MCP server.
`;
};

export const GET = (request: Request) =>
  new Response(docsIndex(requestOrigin(request)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
