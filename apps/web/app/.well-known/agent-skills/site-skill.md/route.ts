import { siteAgentSkillMd } from "@/features/agent-discovery/site-agent-skill";

export const GET = () =>
  new Response(siteAgentSkillMd, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
