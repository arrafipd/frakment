import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { agentDocsDirectiveMarkdown } from "@/features/agent-discovery/directive";
import { markdownResponse } from "@/lib/api";

export const revalidate = false;

const homepageMarkdown = (origin: string): string => {
  const base = origin.replace(/\/$/u, "");

  return `# ${SITE.NAME}

${SITE.DESCRIPTION.LONG}

${agentDocsDirectiveMarkdown}

## Quick links

- [Get started](${base}${ROUTES.docsInstallation}.md)
- [Browse components](${base}${ROUTES.docsComponents}.md)
- [Documentation](${base}${ROUTES.DOCS}.md)
- [LLM index (llms.txt)](${base}${ROUTES.LLMS})
- [API catalog](${base}${ROUTES.apiCatalog})
- [OpenAPI description](${base}${ROUTES.OPENAPI})
- [Agent skills index](${base}${ROUTES.agentSkillsIndex})
`;
};

export const GET = (request: Request) => {
  const body = homepageMarkdown(SITE.URL);

  return markdownResponse(body, true);
};

export const HEAD = (request: Request) => {
  const body = homepageMarkdown(SITE.URL);

  return markdownResponse(body, false);
};
