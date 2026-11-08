#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const REGISTRY = (
  process.env.FRAKMENT_REGISTRY || "https://www.arrafi.dev/frakment"
).replace(/\/$/u, "");

const SCENARIOS = {
  "agent-timeline": {
    components: ["trace", "chain-of-thought", "pulse", "terminal"],
    description: "Agent reasoning timeline with status and command output",
    install: "terminal",
    note: "terminal pulls trace and code-block. Add chain-of-thought and pulse separately.",
  },
  chat: {
    components: [
      "bubble",
      "message",
      "message-scroller",
      "avatar",
      "message-animated",
    ],
    description: "Chat interface with auto-scroll and animated turns",
    install: "message-animated",
    note: "message-animated pulls bubble, message-scroller, and ai automatically.",
  },
  "code-output": {
    components: ["code-block", "terminal"],
    description:
      "Syntax-highlighted code with copy and optional terminal stream",
    install: "code-block",
    note: "code-block pulls button and icons.",
  },
  "empty-state": {
    components: ["empty", "button"],
    description: "Zero-data placeholder with optional call-to-action",
    install: "empty",
    note: "empty is standalone.",
  },
  "login-form": {
    components: ["field", "label", "input", "button", "checkbox"],
    description: "Accessible login form with remember-me toggle",
    install: "field",
    note: "field pulls label and separator.",
  },
  "search-input": {
    components: ["input-group", "input", "button", "spinner"],
    description: "Search input with inline button and loading state",
    install: "input-group",
    note: "input-group pulls input, textarea, and button.",
  },
  "settings-panel": {
    components: ["field", "switch", "toggle-group", "separator"],
    description: "Settings panel with boolean toggles and grouped options",
    install: "toggle-group",
    note: "toggle-group pulls toggle. Add field and switch separately.",
  },
  "status-dashboard": {
    components: ["pulse", "pulse-status", "badge"],
    description: "Service health dashboard with daily timeline",
    install: "pulse",
    note: "pulse pulls badge, pulse-status, trace, and icons.",
  },
};

async function fetchJson(path) {
  const res = await fetch(`${REGISTRY}${path}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${REGISTRY}${path}`);
  }
  return res.json();
}

const server = new Server(
  { name: "frakment-mcp", version: "0.0.1" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      description: "List every frakment component with name and description.",
      inputSchema: { properties: {}, type: "object" },
      name: "list_components",
    },
    {
      description:
        "Get the full source, dependencies, and registry dependencies of one component.",
      inputSchema: {
        properties: { name: { type: "string" } },
        required: ["name"],
        type: "object",
      },
      name: "view_component",
    },
    {
      description: "Search components by name or description substring.",
      inputSchema: {
        properties: { query: { type: "string" } },
        required: ["query"],
        type: "object",
      },
      name: "search_components",
    },
    {
      description: "Get the npx install command for a component.",
      inputSchema: {
        properties: { name: { type: "string" } },
        required: ["name"],
        type: "object",
      },
      name: "get_install_command",
    },
    {
      description:
        "List ready-made component compositions for common UI scenarios (chat, agent-timeline, login-form, etc).",
      inputSchema: { properties: {}, type: "object" },
      name: "list_scenarios",
    },
    {
      description:
        "Get a curated set of components for a UI scenario. Returns components, resolved dependencies, and install command.",
      inputSchema: {
        properties: { scenario: { type: "string" } },
        required: ["scenario"],
        type: "object",
      },
      name: "compose",
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "list_components") {
    const index = await fetchJson("/r/index.json");
    const list = (index.components || []).map(
      (c) => `- ${c.name}: ${c.description || ""}`
    );
    return {
      content: [
        {
          text: `Frakment components (${list.length}):\n\n${list.join("\n")}`,
          type: "text",
        },
      ],
    };
  }

  if (name === "view_component") {
    const comp = await fetchJson(`/r/${args.name}.json`);
    const files = (comp.files || [])
      .map((f) => `--- ${f.path} ---\n${f.content || ""}`)
      .join("\n\n");
    const text = [
      `# ${comp.name}`,
      comp.description ? `\n${comp.description}` : "",
      `\nDependencies: ${(comp.dependencies || []).join(", ") || "none"}`,
      `Registry dependencies: ${(comp.registryDependencies || []).join(", ") || "none"}`,
      `\n${files}`,
    ].join("\n");
    return { content: [{ text, type: "text" }] };
  }

  if (name === "search_components") {
    const q = String(args.query || "").toLowerCase();
    const index = await fetchJson("/r/index.json");
    const hits = (index.components || []).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
    return {
      content: [
        {
          text: `Found ${hits.length} for "${args.query}":\n\n${hits.map((c) => `- ${c.name}: ${c.description || ""}`).join("\n") || "(none)"}`,
          type: "text",
        },
      ],
    };
  }

  if (name === "get_install_command") {
    return {
      content: [{ text: `npx frakment@latest add ${args.name}`, type: "text" }],
    };
  }

  if (name === "list_scenarios") {
    const list = Object.entries(SCENARIOS).map(
      ([key, val]) => `- ${key}: ${val.description}`
    );
    return {
      content: [
        {
          text: `Frakment scenarios (${list.length}):\n\n${list.join("\n")}\n\nUse compose with a scenario name to get the full component set.`,
          type: "text",
        },
      ],
    };
  }

  if (name === "compose") {
    const scenario = String(args.scenario || "").toLowerCase();
    const match = SCENARIOS[scenario];
    if (!match) {
      const available = Object.keys(SCENARIOS).join(", ");
      return {
        content: [
          {
            text: `Unknown scenario: "${args.scenario}".\n\nAvailable: ${available}`,
            type: "text",
          },
        ],
      };
    }
    const lines = [
      `# ${scenario}`,
      "",
      match.description,
      "",
      `Components: ${match.components.join(", ")}`,
      "",
      `Install: npx frakment@latest add ${match.install}`,
      "",
      match.note,
    ];
    return { content: [{ text: lines.join("\n"), type: "text" }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
