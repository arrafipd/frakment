import { llms } from "fumadocs-core/source";

import { LINK } from "@/config/links";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { requestOrigin } from "@/features/agent-discovery/request-origin";
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

${documentationIndex(SITE.URL)}

## Machine-readable Resources

- [Full documentation](${base}${ROUTES.llmsFull}): All documentation pages in a single markdown file.
- [Homepage markdown](${base}${ROUTES.llmsMd}/content.md): Homepage content in markdown.
- [OpenAPI description](${base}${ROUTES.OPENAPI}): OpenAPI 3.1 spec for the Frakment registry.
- [API catalog](${base}${ROUTES.apiCatalog}): RFC 9727 API catalog for the Frakment registry.
- [Agent skill](${base}${ROUTES.agentSkillsSiteSkill}): Site-wide agent skill with usage instructions.
- [Frakment MCP server documentation](${LINK.frakmentMcpDocs}): Documentation for the Frakment MCP server.
`;
};

export const GET = (request: Request) =>
  new Response(docsIndex(requestOrigin(request)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
