#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../package.json" with { type: "json" };

import {
  getRegistryComponentPayload,
  getRegistryIndex,
  getScenario,
  labelRegistryFile,
  scenarios,
} from "./server.ts";

const REGISTRY = (
  process.env.FRAKMENT_REGISTRY || "https://www.arrafi.dev/frakment"
).replace(/\/$/u, "");

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${REGISTRY}${path}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${REGISTRY}${path}`);
  }
  return (await res.json()) as T;
}

const server = new Server(
  { name: "frakment-mcp", version: packageJson.version },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      description:
        "List every Frakment web component with name and description.",
      inputSchema: { properties: {}, type: "object" },
      name: "list_components",
    },
    {
      description:
        "Get source files and dependency metadata for one web component. Binary assets are labeled base64 text.",
      inputSchema: {
        properties: { name: { type: "string" } },
        required: ["name"],
        type: "object",
      },
      name: "view_component",
    },
    {
      description: "Search web components by name or description substring.",
      inputSchema: {
        properties: { query: { type: "string" } },
        required: ["query"],
        type: "object",
      },
      name: "search_components",
    },
    {
      description: "Get the npx install command for a web component.",
      inputSchema: {
        properties: { name: { type: "string" } },
        required: ["name"],
        type: "object",
      },
      name: "get_install_command",
    },
    {
      description:
        "List ready-made compositions of web components for common UI scenarios.",
      inputSchema: { properties: {}, type: "object" },
      name: "list_scenarios",
    },
    {
      description:
        "Get curated web components for a UI scenario and an install command with registry dependencies resolved by the CLI.",
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
  const { name, arguments: toolArguments } = req.params;
  const args = (toolArguments ?? {}) as Record<string, unknown>;

  if (name === "list_components") {
    const index = getRegistryIndex(await fetchJson<unknown>("/r/index.json"));
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
    const comp = getRegistryComponentPayload(
      await fetchJson<unknown>(`/r/${String(args.name)}.json`)
    );
    const files = (comp.files || []).map(labelRegistryFile).join("\n\n");
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
    const index = getRegistryIndex(await fetchJson<unknown>("/r/index.json"));
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
      content: [
        {
          text: `npx frakment@latest add ${String(args.name)}`,
          type: "text",
        },
      ],
    };
  }

  if (name === "list_scenarios") {
    const list = Object.entries(scenarios).map(
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
    const match = getScenario(scenario);
    if (!match) {
      const available = Object.keys(scenarios).join(", ");
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
