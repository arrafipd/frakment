import { describe, expect, it } from "vitest";

import {
  assertSafePath,
  rewriteImports,
  validateRegistryPayload,
} from "./add.js";

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

describe("rewriteImports", () => {
  const src = `import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/card";
export { cn, Button, Card };
`;

  it("is a no-op with default aliases", () => {
    expect(rewriteImports(src, undefined)).toBe(src);
    expect(rewriteImports(src, {})).toBe(src);
  });

  it("rewrites ui, components, and utils prefixes", () => {
    const out = rewriteImports(src, {
      components: "~/components",
      ui: "~/ui",
      utils: "~/lib/cn",
    });
    expect(out).toContain('from "~/ui/button"');
    expect(out).toContain('from "~/lib/cn"');
    expect(out).toContain('from "~/components/card"');
    expect(out).not.toContain("@/components/ui/");
    expect(out).not.toContain("@/lib/utils");
  });

  it("derives ui from components when ui is omitted", () => {
    const out = rewriteImports(src, { components: "~/components" });
    expect(out).toContain('from "~/components/ui/button"');
    expect(out).toContain('from "~/components/card"');
  });

  it("does not rewrite unrelated @/lib paths", () => {
    const input = 'import { springSoft } from "@/lib/animation";\n';
    const out = rewriteImports(input, { utils: "~/lib/cn" });
    expect(out).toBe(input);
  });
});
