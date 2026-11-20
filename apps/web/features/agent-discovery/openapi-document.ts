import { LINK } from "@/config/links";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { homeContentRoute } from "@/lib/docs";

export const buildOpenApiDocument = (
  origin: string
): Record<string, unknown> => {
  const base = origin.replace(/\/$/u, "");

  return {
    externalDocs: {
      description:
        "Frakment MCP server documentation for registry browsing and installation workflows.",
      url: LINK.frakmentMcpDocs,
    },
    info: {
      description: `Read-only HTTP surfaces for the ${SITE.NAME} documentation site and component registry.`,
      title: `${SITE.NAME} public HTTP API`,
      version: "0.1.0",
    },
    openapi: "3.0.3",
    paths: {
      [ROUTES.agentSkillsIndex]: {
        get: {
          responses: {
            "200": { description: "Agent skills index" },
          },
          summary: "Agent skills discovery index",
        },
      },
      [ROUTES.agentSkillsSiteSkill]: {
        get: {
          responses: {
            "200": { description: "Agent skill markdown" },
          },
          summary: "Site agent skill markdown",
        },
      },
      [ROUTES.apiCatalog]: {
        get: {
          responses: {
            "200": { description: "API catalog linkset" },
          },
          summary: "Machine-readable API catalog",
        },
        head: {
          responses: {
            "200": { description: "API catalog headers" },
          },
          summary: "API catalog headers",
        },
      },
      [ROUTES.apiStatus]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    properties: { status: { example: "ok", type: "string" } },
                    type: "object",
                  },
                },
              },
              description: "OK",
            },
          },
          summary: "Service health",
        },
      },
      [ROUTES.llmsFull]: {
        get: {
          responses: {
            "200": { description: "Plain text bundle" },
          },
          summary: "Full LLM-oriented documentation export",
        },
      },
      [ROUTES.LLMS]: {
        get: {
          responses: {
            "200": { description: "Plain text index" },
          },
          summary: "LLM-oriented documentation index",
        },
      },
      [ROUTES.OPENAPI]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "OpenAPI JSON",
            },
          },
          summary: "This OpenAPI document",
        },
      },
      [ROUTES.REGISTRY]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "Registry manifest",
            },
          },
          summary: "Frakment component registry index",
        },
      },
      [ROUTES.DOCS]: {
        get: {
          responses: {
            "200": { description: "HTML documentation" },
          },
          summary: "Documentation (HTML)",
        },
      },
      [homeContentRoute]: {
        get: {
          responses: {
            "200": { description: "Homepage markdown export" },
          },
          summary: "Homepage markdown export",
        },
        head: {
          responses: {
            "200": { description: "Homepage markdown headers" },
          },
          summary: "Homepage markdown headers",
        },
      },
    },
    servers: [{ url: base }],
  };
};
