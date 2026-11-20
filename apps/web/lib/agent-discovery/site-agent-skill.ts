import { createHash } from "node:crypto";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export const siteAgentSkillMd = `# ${SITE.NAME}

## Summary

Help users discover and install components from Frakment, a registry for React web and Expo applications.

## What Frakment is

Frakment provides editable component source for React 19 and Tailwind CSS v4 web projects, plus native components for Expo projects.

## Registry

- Base URL: ${SITE.URL}
- Web component index: ${SITE.URL}/r/index.json
- Expo component index: ${SITE.URL}/r/expo/index.json
- Web component JSON: ${SITE.URL}/r/{name}.json
- Expo component JSON: ${SITE.URL}/r/expo/{name}.json
- Docs: ${SITE.URL}${ROUTES.DOCS}

The CLI requires Node.js 22.18.0 or newer.

The MCP server supports the web registry only. Use the Expo index and the CLI \`--expo\` option for native components.

## Install web components

\`\`\`bash
npx frakment@latest init
npx frakment@latest add button
\`\`\`

The CLI resolves registry dependencies and installs the required npm packages automatically.

## Install native components

Select component names from the Expo index before installing.

\`\`\`bash
npx frakment@latest init --expo
npx frakment@latest add button --expo
\`\`\`

Fetch component names from the registry index instead of guessing slugs.

This skill uses standard Markdown, HTTPS endpoints, and CLI commands. Automatic skill discovery depends on the AI client.

This skill does not grant network, terminal, or project-write permissions.

## MCP

The MCP server exposes registry search, component source, compositions, and CLI install commands.

\`\`\`
npx -y @frakment/mcp
\`\`\`

The MCP server returns commands for the agent to use and does not write files or execute them.

Available tools: \`list_components\`, \`view_component\`, \`search_components\`, \`get_install_command\`, \`list_scenarios\`, and \`compose\`.

## Skills

- Site skill: ${SITE.URL}/.well-known/agent-skills/site-skill.md
- \`frakment-usage\`: ${SITE.URL}/skills/frakment-usage/SKILL.md
`;

export const siteAgentSkillDigest = (): string => {
  const hex = createHash("sha256")
    .update(siteAgentSkillMd, "utf-8")
    .digest("hex");
  return `sha256:${hex}`;
};
