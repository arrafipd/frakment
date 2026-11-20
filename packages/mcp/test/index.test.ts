import { describe, expect, it } from "vitest";

import {
  getRegistryComponentPayload,
  getRegistryIndex,
  getScenario,
  labelRegistryFile,
} from "../src/server.ts";

describe("MCP registry helpers", () => {
  it("formats base64 registry files with an encoding label", () => {
    expect(
      labelRegistryFile({
        content: "AAAA",
        encoding: "base64",
        path: "public/avatar.avif",
      })
    ).toBe("--- public/avatar.avif (encoding: base64) ---\nAAAA");
  });

  it("formats plain registry files without encoding metadata", () => {
    expect(
      labelRegistryFile({
        content: "export {};",
        path: "components/ui/example.tsx",
      })
    ).toBe("--- components/ui/example.tsx ---\nexport {};");
  });

  it("returns a known composition", () => {
    expect(getScenario("chat")?.install).toBe("message");
  });

  it("rejects an unknown composition", () => {
    expect(getScenario("missing")).toBeUndefined();
  });

  it("normalizes registry payloads", () => {
    expect(
      getRegistryIndex({
        components: [{ description: "Button", name: "button" }],
      }).components
    ).toEqual([{ description: "Button", name: "button" }]);

    expect(
      getRegistryComponentPayload({
        files: [{ content: "export {};", path: "components/ui/button.tsx" }],
        name: "button",
      }).name
    ).toBe("button");
  });
});
