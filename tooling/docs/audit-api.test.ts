import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { auditComponentApiTables } from "./audit-api";

const temporaryRoots: string[] = [];

const createFixture = (rows: string) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "frakment-api-audit-"));
  temporaryRoots.push(root);
  const write = (relativePath: string, content: string) => {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
  };
  write(
    "apps/web/tsconfig.json",
    JSON.stringify({
      compilerOptions: {
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        target: "ES2022",
      },
    })
  );
  write(
    "apps/web/registry/button.tsx",
    [
      "export interface ButtonProps {",
      '  variant?: "solid" | "outline";',
      '  size?: "xs" | "sm";',
      "  disabled: boolean;",
      "  value?: string | number | readonly string[];",
      "}",
      "export interface SingleDefaultValueProps { defaultValue?: string }",
      "export interface MultipleDefaultValueProps { defaultValue?: string[] }",
      "export function Button(props: { defaultValue?: string | string[] | number }) {",
      "  return props.defaultValue;",
      "}",
    ].join("\n")
  );
  const docPath = path.join(
    root,
    "apps/web/content/docs/components/web/button.mdx"
  );
  write(
    "apps/web/content/docs/components/web/button.mdx",
    `<PropsTable rows={${rows}} />`
  );
  return { docPath, root };
};

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

describe("auditComponentApiTables", () => {
  it("accepts API rows whose names, types, and requiredness match TypeScript", async () => {
    const { docPath, root } = createFixture(
      '[{ name: "variant", type: "solid | outline" }, { name: "disabled", type: "boolean", required: true }, { name: "value", type: "string | number | readonly string[]" }]'
    );

    await expect(auditComponentApiTables(root, [docPath])).resolves.toEqual([]);
  });

  it("reports props and types that contradict the TypeScript source", async () => {
    const { docPath, root } = createFixture(
      '[{ name: "variant", type: "ghost | outline", required: true }, { name: "missing", type: "string" }]'
    );

    const issues = await auditComponentApiTables(root, [docPath]);

    expect(issues.map(({ code }) => code)).toEqual([
      "api-prop-type-mismatch",
      "api-prop-requiredness-mismatch",
      "api-prop-not-in-source",
    ]);
  });

  it("checks documented enum options without treating data attributes as props", async () => {
    const { docPath, root } = createFixture(
      '[{ name: "size xs", type: "\\"xs\\"" }, { name: "data-invalid", type: "boolean" }]'
    );

    await expect(auditComponentApiTables(root, [docPath])).resolves.toEqual([]);

    const invalid = createFixture(
      '[{ name: "size icon", type: "\\"icon\\"" }]'
    );
    await expect(
      auditComponentApiTables(invalid.root, [invalid.docPath])
    ).resolves.toMatchObject([{ code: "api-prop-option-mismatch" }]);
  });

  it("uses the narrowest source declarations for discriminated prop unions", async () => {
    const { docPath, root } = createFixture(
      '[{ name: "defaultValue", type: "string | string[]" }]'
    );

    await expect(auditComponentApiTables(root, [docPath])).resolves.toEqual([]);
  });
});
