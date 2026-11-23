export const GITHUB = {
  branch: "main",
  org: "frakment",
  repo: "ui",
  user: "arrafipd",
} as const;

const githubUrl = `https://github.com/${GITHUB.org}/${GITHUB.repo}`;

export const LINK = {
  AUTHOR: `https://github.com/${GITHUB.user}`,
  frakmentMcpDocs: "/frakment/mcp",
  GITHUB: githubUrl,
  LICENSE: `${githubUrl}/blob/${GITHUB.branch}/LICENSE`,
} as const;
