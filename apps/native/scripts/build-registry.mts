#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "..");
const manifestPath = path.join(rootDir, "frakment.json");
const outputDir = path.join(rootDir, "public", "r");
const deployDir = path.resolve(rootDir, "../web/public/r/expo");
const skipPackages = new Set(["react", "react-native", "expo", "expo-router"]);

function packageName(spec) {
  if (spec.startsWith("@")) {
    const i = spec.indexOf("@", 1);
    return i > 0 ? spec.slice(0, i) : spec;
  }
  return spec.split("@")[0];
}

function normalizePackage(spec) {
  return spec.startsWith("@")
    ? spec.split("/").slice(0, 2).join("/")
    : spec.split("/")[0];
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map((key) =>
      JSON.stringify(key) + ":" + canonicalize(value[key])
    ).join(",") + "}";
  }
  return JSON.stringify(value);
}

function integrity(payload) {
  return "sha256:" + createHash("sha256")
    .update(canonicalize(payload), "utf8")
    .digest("hex");
}

function safeRelative(value) {
  const normalized = String(value).replace(/\\/gu, "/");
  if (!normalized || normalized.startsWith("/") ||
      normalized.split("/").includes("..")) {
    throw new Error("Unsafe registry path: " + value);
  }
  return normalized;
}

function resolveInside(base, relative) {
  const full = path.resolve(base, relative);
  const rel = path.relative(base, full);
  if (!rel || rel === ".." || rel.startsWith(".." + path.sep) ||
      path.isAbsolute(rel)) {
    throw new Error("Path escapes source directory: " + relative);
  }
  return full;
}

function detectImports(source) {
  const external = new Set();
  const registry = new Set();
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/gu,
    /\bimport\s*["']([^"']+)["']/gu
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const spec = match[1];

      if (spec.startsWith("@/components/ui/")) {
        const name = spec.slice("@/components/ui/".length).split("/")[0];
        if (name) registry.add(name);
        continue;
      }
      if (spec.startsWith("@/") || spec.startsWith(".") ||
          spec.startsWith("node:") || spec.startsWith("next/")) continue;

      const name = normalizePackage(spec);
      if (!skipPackages.has(name)) external.add(name);
    }
  }

  return { external: [...external], registry: [...registry] };
}

async function walkFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(full, baseDir));
    } else if (entry.isFile()) {
      files.push({
        fullPath: full,
        relativePath: path.relative(baseDir, full).split(path.sep).join("/")
      });
    }
  }
  return files;
}

async function main() {
  const manifest = JSON.parse(
    (await fs.readFile(manifestPath, "utf8")).replace(/^\uFEFF/u, "")
  );
  await fs.mkdir(outputDir, { recursive: true });

  for (const entry of await fs.readdir(outputDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await fs.rm(path.join(outputDir, entry.name));
    }
  }

  for (const component of manifest.components) {
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(component.name)) {
      throw new Error("Invalid component name: " + component.name);
    }

    const files = [];
    const autoExternal = new Set();
    const autoRegistry = new Set();

    async function addText(fullPath, target) {
      const content = (await fs.readFile(fullPath, "utf8")).replace(/\r\n/gu, "\n");
      files.push({ content, path: safeRelative(target) });

      if (/\.[cm]?tsx?$/u.test(fullPath)) {
        const detected = detectImports(content);
        detected.external.forEach((name) => autoExternal.add(name));
        detected.registry.forEach((name) => autoRegistry.add(name));
      }
    }

    if (component.sourceDir) {
      const srcDir = resolveInside(path.dirname(manifestPath), component.sourceDir);
      const targetBase = safeRelative(component.targetDir ?? component.sourceDir);

      for (const file of await walkFiles(srcDir)) {
        await addText(
          file.fullPath,
          path.posix.join(targetBase, file.relativePath)
        );
      }
    } else if (component.source) {
      const srcPath = resolveInside(path.dirname(manifestPath), component.source);
      await addText(srcPath, component.target);
    } else {
      throw new Error("Missing source for " + component.name);
    }

    for (const additional of component.additionalFiles ?? []) {
      const src = resolveInside(path.dirname(manifestPath), additional.source);
      await addText(src, additional.target);
    }

    autoRegistry.delete(component.name);

    const manualDependencies = component.dependencies ?? [];
    const manualPackages = new Set(manualDependencies.map(packageName));
    const dependencies = [...new Set([
      ...[...autoExternal].filter((name) => !manualPackages.has(packageName(name))),
      ...manualDependencies
    ])].sort();

    const registryDependencies = [...new Set([
      ...autoRegistry,
      ...(component.registryDependencies ?? [])
    ])].sort();

    for (const asset of component.assets ?? []) {
      const assetPath = resolveInside(path.dirname(manifestPath), asset.path);
      const target = safeRelative(asset.target);
      const content = await fs.readFile(assetPath);

      files.push({
        content: content.toString("base64"),
        encoding: "base64",
        path: target,
        target,
        type: "registry:file"
      });
    }

    const payload = {
      dependencies,
      deprecated: component.deprecated ?? false,
      description: component.description,
      files,
      name: component.name,
      registryDependencies,
      title: component.title,
      version: component.version ?? "0.0.0"
    };

    payload.integrity = integrity(payload);

    await fs.writeFile(
      path.join(outputDir, component.name + ".json"),
      JSON.stringify(payload, null, 2),
      "utf8"
    );

    console.log("  Built native registry: " + component.name);
  }

  const index = {
    components: manifest.components.map((component) => ({
      deprecated: component.deprecated ?? false,
      description: component.description,
      name: component.name,
      title: component.title,
      version: component.version ?? "0.0.0"
    })),
    homepage: manifest.homepage,
    name: manifest.name
  };

  await fs.writeFile(
    path.join(outputDir, "index.json"),
    JSON.stringify(index, null, 2),
    "utf8"
  );

  const stat = await fs.lstat(deployDir).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (stat?.isSymbolicLink()) {
    throw new Error("Refusing to write through deployment symlink.");
  }

  await fs.mkdir(deployDir, { recursive: true });

  for (const entry of await fs.readdir(deployDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await fs.rm(path.join(deployDir, entry.name));
    }
  }

  for (const entry of await fs.readdir(outputDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await fs.copyFile(
        path.join(outputDir, entry.name),
        path.join(deployDir, entry.name)
      );
    }
  }

  console.log("Native registry built: " + manifest.components.length + " component(s).");
  console.log("Source output: apps/native/public/r/");
  console.log("Deployment copy: apps/web/public/r/expo/");
}

main().catch((error) => {
  console.error("Native registry build failed:", error);
  process.exit(1);
});
