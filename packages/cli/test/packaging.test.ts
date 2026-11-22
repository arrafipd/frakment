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
  bin: { frakment: string };
  version: string;
};

describe("published CLI artifacts", () => {
  it("runs the compiled binary and reads its packaged version", () => {
    const output = execFileSync(
      process.execPath,
      [path.join(packageRoot, packageJson.bin.frakment), "--version"],
      { encoding: "utf8" }
    );

    expect(output.trim()).toBe(packageJson.version);
  });

  it("includes the registry template beside the compiled binary", () => {
    const template = JSON.parse(
      readFileSync(
        path.join(packageRoot, "dist", "templates", "components.json"),
        "utf8"
      )
    );

    expect(template.registry).toBe("https://www.arrafi.dev/frakment/r");
  });
});
