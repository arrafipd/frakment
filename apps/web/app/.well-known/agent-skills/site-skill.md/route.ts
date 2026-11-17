import { siteAgentSkillMd } from "@/lib/agent-discovery/site-agent-skill";

export const GET = () =>
  new Response(siteAgentSkillMd, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
