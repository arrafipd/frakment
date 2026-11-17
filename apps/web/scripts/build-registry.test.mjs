import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "public/r");

describe("build-registry", () => {
  beforeAll(() => {
    execFileSync("node", ["scripts/build-registry.mjs"], {
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
