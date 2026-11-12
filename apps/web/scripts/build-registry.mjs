#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const manifestPath = path.join(rootDir, "frakment.json");
const outputDir = path.join(rootDir, "public/r");

const SKIP_PACKAGES = new Set(["react", "react-dom", "next"]);

function normalizePackage(spec) {
  if (spec.startsWith("@")) {
    return spec.split("/").slice(0, 2).join("/");
  }
  return spec.split("/")[0];
}

function packageName(spec) {
  if (spec.startsWith("@")) {
    const versionSeparator = spec.indexOf("@", 1);
    return versionSeparator > 0 ? spec.slice(0, versionSeparator) : spec;
  }
  return spec.split("@")[0];
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function createIntegrity(payload) {
  return `sha256:${createHash("sha256")
    .update(canonicalize(payload), "utf8")
    .digest("hex")}`;
}

function detectImports(src) {
  const external = new Set();
  const registry = new Set();

  const patterns = [
    /from\s+["']([^"']+)["']/gu,
    /import\s*\(\s*["']([^"']+)["']\s*\)/gu,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) {
      const spec = m[1];

      if (spec.startsWith("@/components/ui/")) {
        const name = spec.slice("@/components/ui/".length).split("/")[0];
        if (name) {
          registry.add(name);
        }
        continue;
      }
      if (spec.startsWith("@/")) {
        continue;
      }
      if (spec.startsWith(".")) {
        continue;
      }
      if (spec.startsWith("node:")) {
        continue;
      }
      if (spec.startsWith("next/")) {
        continue;
      }

      const root = normalizePackage(spec);
      if (SKIP_PACKAGES.has(root)) {
        continue;
      }
      external.add(root);
    }
  }

  return { external: [...external].sort(), registry: [...registry].sort() };
}

async function walkFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath, baseDir)));
    } else if (entry.isFile()) {
      files.push({
        fullPath,
        relativePath: path.relative(baseDir, fullPath).replace(/\\/gu, "/"),
      });
    }
  }
  return files;
}

async function main() {
  console.log("🔨 Building fraktment registry...");

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  await fs.mkdir(outputDir, { recursive: true });

  for (const component of manifest.components) {
    const files = [];
    const autoExternal = new Set();
    const autoRegistry = new Set();

    if (component.sourceDir) {
      const srcDir = path.resolve(
        path.dirname(manifestPath),
        component.sourceDir
      );
      const dirFiles = await walkFiles(srcDir);
      const targetBase = component.targetDir ?? component.sourceDir;

      for (const f of dirFiles) {
        const content = (await fs.readFile(f.fullPath, "utf8")).replace(
          /\r\n/gu,
          "\n"
        );
        files.push({
          content,
          path: `${targetBase}/${f.relativePath}`.replace(/\/+/gu, "/"),
        });
        if (f.fullPath.endsWith(".ts") || f.fullPath.endsWith(".tsx")) {
          const detected = detectImports(content);
          detected.external.forEach((x) => autoExternal.add(x));
          detected.registry.forEach((x) => autoRegistry.add(x));
        }
      }
    } else if (component.source) {
      const srcPath = path.resolve(
        path.dirname(manifestPath),
        component.source
      );
      const content = (await fs.readFile(srcPath, "utf8")).replace(
        /\r\n/gu,
        "\n"
      );
      files.push({ content, path: component.target });
      const detected = detectImports(content);
      detected.external.forEach((x) => autoExternal.add(x));
      detected.registry.forEach((x) => autoRegistry.add(x));
    } else {
      throw new Error(
        `Component "${component.name}" has no source or sourceDir`
      );
    }

    if (component.additionalFiles && Array.isArray(component.additionalFiles)) {
      for (const additional of component.additionalFiles) {
        const srcPath = path.resolve(
          path.dirname(manifestPath),
          additional.source
        );
        const content = (await fs.readFile(srcPath, "utf8")).replace(
          /\r\n/gu,
          "\n"
        );
        files.push({ content, path: additional.target });
        const detected = detectImports(content);
        detected.external.forEach((x) => autoExternal.add(x));
      }
    }

    // buang self-reference
    autoRegistry.delete(component.name);

    // merge: auto-detect (dari kode) ∪ manual (dari manifest)
    const manualDependencies = component.dependencies ?? [];
    const manualPackageNames = new Set(manualDependencies.map(packageName));
    const dependencies = [
      ...new Set([
        ...[...autoExternal].filter(
          (dependency) => !manualPackageNames.has(packageName(dependency))
        ),
        ...manualDependencies,
      ]),
    ].sort();
    const registryDependencies = [
      ...new Set([...autoRegistry, ...(component.registryDependencies ?? [])]),
    ].sort();
    // Handle assets (binary files, base64)
    if (component.assets && Array.isArray(component.assets)) {
      for (const asset of component.assets) {
        const assetPath = path.resolve(path.dirname(manifestPath), asset.path);
        const assetBuf = await fs.readFile(assetPath);
        files.push({
          content: assetBuf.toString("base64"),
          encoding: "base64",
          path: asset.target,
          target: asset.target,
          type: "registry:file",
        });
      }
    }

    const payload = {
      dependencies,
      deprecated: component.deprecated ?? false,
      description: component.description,
      files,
      name: component.name,
      registryDependencies,
      title: component.title,
      version: component.version ?? "0.0.0",
    };
    payload.integrity = createIntegrity(payload);

    const outPath = path.join(outputDir, `${component.name}.json`);
    await fs.writeFile(outPath, JSON.stringify(payload, null, 2));

    const depsStr = dependencies.length ? dependencies.join(", ") : "-";
    const regStr = registryDependencies.length
      ? registryDependencies.join(", ")
      : "-";
    console.log(
      `  ✓ ${component.name} → public/r/${component.name}.json (${files.length} file${files.length > 1 ? "s" : ""})`
    );
    console.log(`      deps: [${depsStr}]  regdeps: [${regStr}]`);
  }

  const index = {
    components: manifest.components.map((c) => ({
      deprecated: c.deprecated ?? false,
      description: c.description,
      name: c.name,
      title: c.title,
      version: c.version ?? "0.0.0",
    })),
    homepage: manifest.homepage,
    name: manifest.name,
  };
  await fs.writeFile(
    path.join(outputDir, "index.json"),
    JSON.stringify(index, null, 2)
  );
  console.log("  ✓ index.json");
  console.log(`\n✅ Built ${manifest.components.length} component(s).`);
  // Skills
  if (manifest.skills && manifest.skills.length > 0) {
    const skillsOutDir = path.join(rootDir, "public/skills");
    await fs.mkdir(skillsOutDir, { recursive: true });
    const skillIndex = [];
    for (const skill of manifest.skills) {
      const srcPath = path.resolve(path.dirname(manifestPath), skill.source);
      const content = (await fs.readFile(srcPath, "utf8")).replace(
        /\r\n/gu,
        "\n"
      );
      const skillDir = path.join(skillsOutDir, skill.name);
      await fs.mkdir(skillDir, { recursive: true });
      await fs.writeFile(path.join(skillDir, "SKILL.md"), content);
      const hex = createHash("sha256").update(content, "utf8").digest("hex");
      skillIndex.push({
        description: skill.description,
        digest: `sha256:${hex}`,
        name: skill.name,
        title: skill.title,
        url: `/skills/${skill.name}/SKILL.md`,
        version: skill.version ?? "0.0.0",
      });
      console.log(
        `  ✓ skill ${skill.name} → public/skills/${skill.name}/SKILL.md`
      );
    }
    await fs.writeFile(
      path.join(skillsOutDir, "index.json"),
      JSON.stringify({ skills: skillIndex }, null, 2)
    );
    console.log("  ✓ public/skills/index.json");
  }
}

main().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
