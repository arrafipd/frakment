export const GITHUB = {
  branch: "main",
  org: "arrafipd",
  repo: "frakment",
  user: "arrafipd",
} as const;

const githubUrl = `https://github.com/${GITHUB.org}/${GITHUB.repo}`;

export const LINK = {
  AUTHOR: `https://github.com/${GITHUB.user}`,
  FRAKMENT_MCP_DOCS: "/frakment/mcp",
  GITHUB: githubUrl,
  LICENSE: `${githubUrl}/blob/${GITHUB.branch}/LICENSE`,
  SPONSOR: "https://liberapay.com/frakment",
} as const;
