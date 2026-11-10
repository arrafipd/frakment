import { describe, expect, it } from "vitest";

import { assertSafePath, validateRegistryPayload } from "./add.js";

const unsignedPayload = {
  dependencies: ["@frakment/react@^0.0.3", "motion@^14.10.0"],
  files: [
    {
      content: "export {};\n",
      path: "components/ui/example.tsx",
    },
  ],
  name: "example",
  registryDependencies: ["button"],
};

const payload = {
  ...unsignedPayload,
  integrity:
    "sha256:d75c2cab99c7b025d584adc04eb9b2eb86794f1a51df578f94c74c0eef22634d",
};

describe("registry payload validation", () => {
  it("accepts a valid component payload", () => {
    expect(validateRegistryPayload(payload, "example")).toEqual(payload);
  });

  it("rejects a component name mismatch", () => {
    expect(() => validateRegistryPayload(payload, "button")).toThrow(
      "unexpected component name"
    );
  });

  it("rejects invalid dependency specifications", () => {
    expect(() =>
      validateRegistryPayload(
        { ...payload, dependencies: ["file:../malicious-package"] },
        "example"
      )
    ).toThrow(/invalid dependency/i);
  });

  it("rejects malformed files and registry dependencies", () => {
    expect(() =>
      validateRegistryPayload(
        {
          ...payload,
          files: [{ content: "x", encoding: "hex", path: "file.ts" }],
        },
        "example"
      )
    ).toThrow("unsupported encoding");
    expect(() =>
      validateRegistryPayload(
        { ...payload, registryDependencies: ["../button"] },
        "example"
      )
    ).toThrow("Invalid component name");
  });

  it("rejects content that does not match the integrity hash", () => {
    expect(() =>
      validateRegistryPayload(
        {
          ...payload,
          files: [{ content: "changed", path: "components/ui/example.tsx" }],
        },
        "example"
      )
    ).toThrow("integrity check failed");
  });
});

describe("registry target paths", () => {
  it("accepts paths within the project root", async () => {
    await expect(
      assertSafePath(process.cwd(), "components/ui/button.tsx")
    ).resolves.toContain("components");
  });

  it("rejects parent traversal and absolute paths", async () => {
    await expect(
      assertSafePath(process.cwd(), "../../outside.txt")
    ).rejects.toThrow("Parent traversal rejected");
    await expect(
      assertSafePath(process.cwd(), "C:\\outside.txt")
    ).rejects.toThrow("Absolute path rejected");
  });
});
