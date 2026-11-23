import { SITE } from "@/config/site";
import { buildOpenApiDocument } from "@/features/agent-discovery/openapi-document";

export const GET = (request: Request) => {
  const origin = SITE.URL;
  const doc = buildOpenApiDocument(origin);

  return Response.json(doc, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
};
