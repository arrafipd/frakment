import { LINK } from "@/config/links";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { requestOrigin } from "@/features/agent-discovery/request-origin";
import { homeContentRoute } from "@/lib/docs";

const PROFILE = "https://www.rfc-editor.org/info/rfc9727";

const catalogLinkset = (origin: string) => {
  const base = origin.replace(/\/$/u, "");
  const siteBase = SITE.URL;

  return {
    linkset: [
      {
        anchor: `${siteBase}`,
        "api-catalog": [
          {
            href: `${base}${ROUTES.apiCatalog}`,
            type: `application/linkset+json; profile="${PROFILE}"`,
          },
        ],
        describedby: [
          {
            href: `${base}${ROUTES.agentSkillsIndex}`,
            type: "application/json",
          },
          {
            href: `${base}${ROUTES.agentSkillsSiteSkill}`,
            type: "text/markdown",
          },
        ],
        "service-desc": [
          { href: `${siteBase}${ROUTES.OPENAPI}`, type: "application/json" },
        ],
        "service-doc": [
          { href: `${siteBase}${ROUTES.DOCS}`, type: "text/html" },
          { href: `${siteBase}${ROUTES.LLMS}`, type: "text/plain" },
          { href: `${siteBase}${ROUTES.llmsFull}`, type: "text/plain" },
          { href: `${siteBase}${homeContentRoute}`, type: "text/markdown" },
          { href: `${base}${LINK.frakmentMcpDocs}`, type: "text/html" },
        ],
        status: [
          { href: `${siteBase}${ROUTES.apiStatus}`, type: "application/json" },
        ],
      },
      {
        anchor: `${siteBase}${ROUTES.REGISTRY}`,
        "service-desc": [
          { href: `${siteBase}${ROUTES.OPENAPI}`, type: "application/json" },
        ],
        "service-doc": [
          { href: `${siteBase}${ROUTES.DOCS}`, type: "text/html" },
        ],
        status: [
          { href: `${siteBase}${ROUTES.apiStatus}`, type: "application/json" },
        ],
      },
    ],
  };
};

export const GET = (request: Request) => {
  const origin = requestOrigin(request);
  const body = JSON.stringify(catalogLinkset(origin));

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": `application/linkset+json; profile="${PROFILE}"`,
    },
  });
};

export const HEAD = () => {
  const profile = `application/linkset+json; profile="${PROFILE}"`;

  return new Response(null, {
    headers: {
      "Content-Type": profile,
      Link: `<${ROUTES.apiCatalog}>; rel="api-catalog"`,
    },
  });
};
