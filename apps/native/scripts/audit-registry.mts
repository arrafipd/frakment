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
let errors = 0;

function fail(message) {
  console.error("  FAIL: " + message);
  errors++;
}

function packageName(spec) {
  if (spec.startsWith("@")) {
    const i = spec.indexOf("@", 1);
    return i > 0 ? spec.slice(0, i) : spec;
  }
  return spec.split("@")[0];
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
      } else if (!spec.startsWith("@/") && !spec.startsWith(".") &&
                 !spec.startsWith("node:") && !spec.startsWith("next/")) {
        const name = spec.startsWith("@")
          ? spec.split("/").slice(0, 2).join("/")
          : spec.split("/")[0];
        if (!skipPackages.has(name)) external.add(name);
      }
    }
  }
  return { external, registry };
}

function resolveInside(base, relative) {
  const full = path.resolve(base, relative);
  const rel = path.relative(base, full);
  if (!rel || rel === ".." || rel.startsWith(".." + path.sep) ||
      path.isAbsolute(rel)) throw new Error("Unsafe path: " + relative);
  return full;
}

async function walkFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(full, baseDir));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

async function hash(file) {
  return createHash("sha256").update(await fs.readFile(file)).digest("hex");
}

async function main() {
  const manifest = JSON.parse(
    (await fs.readFile(manifestPath, "utf8")).replace(/^\uFEFF/u, "")
  );
  const names = new Set(manifest.components.map((component) => component.name));

  if (names.size !== manifest.components.length) fail("Duplicate component names.");

  for (const component of manifest.components) {
    const external = new Set();
    const registry = new Set();
    const sourceFiles = [];

    if (component.sourceDir) {
      const dir = resolveInside(path.dirname(manifestPath), component.sourceDir);
      sourceFiles.push(...await walkFiles(dir));
    } else if (component.source) {
      sourceFiles.push(resolveInside(path.dirname(manifestPath), component.source));
    }

    for (const additional of component.additionalFiles ?? []) {
      sourceFiles.push(resolveInside(path.dirname(manifestPath), additional.source));
    }

    for (const file of sourceFiles) {
      const content = await fs.readFile(file, "utf8");
      const found = detectImports(content);
      found.external.forEach((name) => external.add(name));
      found.registry.forEach((name) => registry.add(name));
    }

    const declared = new Set((component.dependencies ?? []).map(packageName));
    for (const name of external) {
      if (!declared.has(name)) fail(component.name + ": undeclared package " + name);
    }

    const declaredRegistry = new Set(component.registryDependencies ?? []);
    for (const name of registry) {
      if (!declaredRegistry.has(name)) {
        fail(component.name + ": missing registry dependency " + name);
      }
    }
    for (const name of declaredRegistry) {
      if (!names.has(name)) fail(component.name + ": unknown registry dependency " + name);
    }

    if (component.source && component.target) {
      const source = resolveInside(path.dirname(manifestPath), component.source);
      const mirror = resolveInside(rootDir, component.target);
      try {
        if (await hash(source) !== await hash(mirror)) {
          fail(component.name + ": registry source differs from components/ui mirror");
        }
      } catch {
        fail(component.name + ": source or mirror missing");
      }
    }

    const output = path.join(outputDir, component.name + ".json");
    try {
      const payload = JSON.parse(await fs.readFile(output, "utf8"));
      const actualIntegrity = payload.integrity;
      delete payload.integrity;
      if (integrity(payload) !== actualIntegrity) {
        fail(component.name + ": integrity mismatch");
      }

      const deployed = path.join(deployDir, component.name + ".json");
      if (await hash(output) !== await hash(deployed)) {
        fail(component.name + ": deployment copy differs from native output");
      }
    } catch {
      fail(component.name + ": registry output missing or invalid");
    }
  }

  try {
    const index = JSON.parse(await fs.readFile(path.join(outputDir, "index.json"), "utf8"));
    const indexNames = new Set(index.components.map((component) => component.name));
    for (const name of names) {
      if (!indexNames.has(name)) fail("index.json missing " + name);
    }

    const deployedIndex = path.join(deployDir, "index.json");
    if (await hash(path.join(outputDir, "index.json")) !== await hash(deployedIndex)) {
      fail("Deployment index differs from native index.");
    }
  } catch {
    fail("index.json missing or invalid.");
  }

  if (errors) {
    console.error("Native registry audit failed: " + errors + " error(s).");
    process.exit(1);
  }
  console.log("Native registry audit passed.");
}

main().catch((error) => {
  console.error("Native registry audit failed:", error);
  process.exit(1);
});
