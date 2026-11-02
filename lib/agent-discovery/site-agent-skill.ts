import { createHash } from "node:crypto";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export const SITE_AGENT_SKILL_MD = `# ${SITE.NAME}

## Summary

Help users discover and install components from Frakment, a standalone registry of AI and chat primitives with no shadcn dependency.

## What Frakment is

Frakment ships self-contained component primitives for AI interfaces. Every component is a single .tsx file installed by the frakment CLI. There is no shadcn dependency chain.

## Registry

- Base URL: ${SITE.URL}
- Component index: ${SITE.URL}/r/index.json
- Component JSON: ${SITE.URL}/r/{name}.json
- Docs: ${SITE.URL}${ROUTES.DOCS}

## Install

\`\`\`bash
npx frakment@latest init
npx frakment@latest add chain-of-thought
\`\`\`

The CLI resolves registry dependencies automatically. For example, chain-of-thought installs trace first.

## Components

Two groups:

1. Components: badge, button, code-block, item, avatar, separator
2. AI Elements: bubble, message, trace, chain-of-thought, marker, spinner, pulse, pulse-status

Browse:

- ${SITE.URL}${ROUTES.DOCS_COMPONENTS}
- ${SITE.URL}${ROUTES.DOCS_AI_ELEMENTS}

## MCP

A frakment MCP server ships with this project. Run it with:

\`\`\`
npx -y frakment-mcp
\`\`\`

Exposed tools: \`list_components\`, \`view_component\`, \`search_components\`, \`get_install_command\`.

## Skills

- Site skill: ${SITE.URL}/.well-known/agent-skills/site-skill.md
- \`frakment-usage\`: ${SITE.URL}/skills/frakment-usage/SKILL.md
`;

export const siteAgentSkillDigest = (): string => {
  const hex = createHash("sha256")
    .update(SITE_AGENT_SKILL_MD, "utf-8")
    .digest("hex");
  return `sha256:${hex}`;
};
