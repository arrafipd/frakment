import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { auditDocsData } from "./audit-data";

const temporaryRoots: string[] = [];

const createFixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "frakment-doc-audit-"));
  temporaryRoots.push(root);
  const write = (relativePath: string, content: string) => {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
  };
  write(
    "apps/web/frakment.json",
    JSON.stringify({ components: [{ name: "button" }] })
  );
  write(
    "apps/native/frakment.json",
    JSON.stringify({ components: [{ name: "separator" }] })
  );
  write(
    "apps/web/content/docs/components/web/button.mdx",
    [
      'import { ButtonDemo } from "@/examples/button-demo";',
      '<ComponentPreview name="button-demo" src="examples/button-demo.tsx">',
      "  <ButtonDemo />",
      "</ComponentPreview>",
      '<ComponentSource name="button" />',
      "[Button](/docs/components/web/button)",
      "```bash",
      "npx frakment add button",
      "```",
    ].join("\n")
  );
  write(
    "apps/web/content/docs/components/native/separator.mdx",
    "Native separator docs."
  );
  write(
    "apps/web/examples/button-demo.tsx",
    "export const ButtonDemo = () => null;"
  );
  write("apps/web/registry/button.tsx", "export const Button = () => null;");
  write(
    "apps/native/registry/separator.tsx",
    "export const Separator = () => null;"
  );
  return { root, write };
};

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

describe("auditDocsData", () => {
  it("accepts docs that reference existing registry items and sources", () => {
    const { root } = createFixture();

    return expect(auditDocsData(root)).resolves.toEqual({
      filesScanned: 2,
      issues: [],
    });
  });

  it("reports links, examples, commands, and component pages that drift", async () => {
    const { root, write } = createFixture();
    write(
      "apps/web/content/docs/components/web/button.mdx",
      [
        'import { MissingDemo } from "@/examples/missing-demo";',
        '<ComponentPreview name="missing" src="examples/missing.tsx" />',
        '<ComponentSource name="missing" />',
        "[Missing](/docs/components/web/missing)",
        "npx frakment add missing",
      ].join("\n")
    );
    write(
      "apps/web/content/docs/components/web/unknown.mdx",
      "Unknown component page."
    );

    const codes = (await auditDocsData(root)).issues.map(({ code }) => code);

    expect(codes).toContain("missing-local-import");
    expect(codes).toContain("missing-preview-source");
    expect(codes).toContain("missing-component-source");
    expect(codes).toContain("missing-doc-link");
    expect(codes).toContain("unknown-registry-command");
    expect(codes).toContain("orphan-component-doc");
  });
});
