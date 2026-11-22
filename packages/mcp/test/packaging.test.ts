import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const packageJson = JSON.parse(
  readFileSync(path.join(packageRoot, "package.json"), "utf8")
) as {
  bin: { "frakment-mcp": string };
  version: string;
};

describe("published MCP artifacts", () => {
  it("starts the compiled server and reports its package version", () => {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "packaging-test", version: "1.0.0" },
      },
    };
    const output = execFileSync(
      process.execPath,
      [path.join(packageRoot, packageJson.bin["frakment-mcp"])],
      {
        encoding: "utf8",
        input: `${JSON.stringify(request)}\n`,
        timeout: 10_000,
      }
    );
    const response = output
      .split(/\r?\n/u)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((message) => message.id === 1);

    expect(response.result.serverInfo.version).toBe(packageJson.version);
  });
});
