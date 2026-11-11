import { SITE } from "@/constants/site";
import { buildOpenApiDocument } from "@/lib/agent-discovery/openapi-document";

export const GET = (request: Request) => {
  const origin = SITE.URL;
  const doc = buildOpenApiDocument(origin);

  return Response.json(doc, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
};
