import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
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
            href: `${base}${ROUTES.API_CATALOG}`,
            type: `application/linkset+json; profile="${PROFILE}"`,
          },
        ],
        describedby: [
          {
            href: `${base}${ROUTES.AGENT_SKILLS_INDEX}`,
            type: "application/json",
          },
          {
            href: `${base}${ROUTES.AGENT_SKILLS_SITE_SKILL}`,
            type: "text/markdown",
          },
        ],
        "service-desc": [
          { href: `${siteBase}${ROUTES.OPENAPI}`, type: "application/json" },
        ],
        "service-doc": [
          { href: `${siteBase}${ROUTES.DOCS}`, type: "text/html" },
          { href: `${siteBase}${ROUTES.LLMS}`, type: "text/plain" },
          { href: `${siteBase}${ROUTES.LLMS_FULL}`, type: "text/plain" },
          { href: `${siteBase}${homeContentRoute}`, type: "text/markdown" },
          { href: `${base}${LINK.FRAKMENT_MCP_DOCS}`, type: "text/html" },
        ],
        status: [
          { href: `${siteBase}${ROUTES.API_STATUS}`, type: "application/json" },
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
          { href: `${siteBase}${ROUTES.API_STATUS}`, type: "application/json" },
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
      Link: `<${ROUTES.API_CATALOG}>; rel="api-catalog"`,
    },
  });
};
