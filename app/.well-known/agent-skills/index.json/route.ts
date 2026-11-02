import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ROUTES } from "@/constants/routes";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { siteAgentSkillDigest } from "@/lib/agent-discovery/site-agent-skill";

async function fileDigest(source: string): Promise<string | null> {
  try {
    const content = await readFile(
      path.join(/*turbopackIgnore: true*/ process.cwd(), source),
      "utf-8"
    );
    const hex = createHash("sha256").update(content, "utf-8").digest("hex");
    return `sha256:${hex}`;
  } catch {
    return null;
  }
}

export const GET = async (request: Request) => {
  const origin = requestOrigin(request);
  const base = origin.replace(/\/$/, "");

  const frakmentUsageDigest = await fileDigest(
    "skills/frakment-usage/SKILL.md"
  );

  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          description:
            "Site-wide orientation for Frakment, a standalone registry of AI and chat primitives with no external registry dependency.",
          digest: siteAgentSkillDigest(),
          name: "frakment",
          type: "skill-md",
          url: `${base}${ROUTES.AGENT_SKILLS_SITE_SKILL}`,
        },
        ...(frakmentUsageDigest
          ? [
              {
                description:
                  "Discover, fetch, search, and install Frakment components. Covers /r/index.json, per-component JSON, and the frakment CLI.",
                digest: frakmentUsageDigest,
                name: "frakment-usage",
                type: "skill-md",
                url: `${base}/skills/frakment-usage/SKILL.md`,
              },
            ]
          : []),
      ],
    },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
};
