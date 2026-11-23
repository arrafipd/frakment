import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../../apps/web");
const repoRoot = path.resolve(__dirname, "../../..");
const buildRegistryScript = path.join(
  repoRoot,
  "tooling/registry/web/build-registry.ts"
);
const outputDir = path.join(rootDir, "public/r");

describe("build-registry", () => {
  beforeAll(() => {
    execFileSync("node", [buildRegistryScript], {
      cwd: rootDir,
      stdio: "pipe",
    });
  });

  it("generates public/r/index.json with components", async () => {
    const raw = await fs.readFile(path.join(outputDir, "index.json"), "utf8");
    const index = JSON.parse(raw);

    expect(index.name).toBe("frakment");
    expect(Array.isArray(index.components)).toBe(true);
    expect(index.components.length).toBeGreaterThan(0);
  });

  it("registry manifest counts match source files", async () => {
    const webManifestRaw = await fs.readFile(
      path.join(rootDir, "frakment.json"),
      "utf8"
    );
    const nativeRoot = path.resolve(rootDir, "../native");
    const nativeManifestRaw = await fs.readFile(
      path.join(nativeRoot, "frakment.json"),
      "utf8"
    );
    const webManifest = JSON.parse(webManifestRaw);
    const nativeManifest = JSON.parse(nativeManifestRaw);
    const webSourceFiles = await fs.readdir(path.join(rootDir, "registry"));
    const nativeSourceFiles = await fs.readdir(
      path.join(nativeRoot, "registry")
    );

    expect(webManifest.components.length).toBe(
      webSourceFiles.filter((file) => file.endsWith(".tsx")).length
    );
    expect(nativeManifest.components.length).toBe(
      nativeSourceFiles.filter((file) => file.endsWith(".tsx")).length
    );
  });

  it("every component has name, version, and deprecated", async () => {
    const raw = await fs.readFile(path.join(outputDir, "index.json"), "utf8");
    const index = JSON.parse(raw);

    for (const c of index.components) {
      expect(c.name, "component missing name").toBeTruthy();
      expect(c).toHaveProperty("version");
      expect(c).toHaveProperty("deprecated");
    }
  });

  it("generates per-component JSON with files array", async () => {
    const raw = await fs.readFile(path.join(outputDir, "button.json"), "utf8");
    const button = JSON.parse(raw);

    expect(button.name).toBe("button");
    expect(Array.isArray(button.files)).toBe(true);
    expect(button.files.length).toBeGreaterThan(0);
    expect(button.files[0]).toHaveProperty("path");
    expect(button.files[0]).toHaveProperty("content");
    expect(button.integrity).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(button.dependencies).toEqual(["class-variance-authority@^0.7.1"]);
  });

  it("attachment has registry dependencies on button and shimmer", async () => {
    const raw = await fs.readFile(
      path.join(outputDir, "attachment.json"),
      "utf8"
    );
    const attachment = JSON.parse(raw);

    expect(attachment.registryDependencies).toContain("button");
    expect(attachment.registryDependencies).toContain("shimmer");
  });

  it("generates skill files under public/skills", async () => {
    const skillPath = path.join(
      rootDir,
      "public/skills/frakment-usage/SKILL.md"
    );
    const content = await fs.readFile(skillPath, "utf8");

    expect(content).toContain("name: frakment-usage");
  });
});
