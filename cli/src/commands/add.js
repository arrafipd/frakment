import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import * as p from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

import { detectPackageManager, findProjectRoot } from "../utils/detect.js";

async function fetchComponent(name, registryUrl, s) {
  s.start(`fetching ${name}`);
  try {
    const res = await fetch(`${registryUrl}/${name}.json`);
    if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
    const payload = await res.json();
    s.stop(`${pc.green("✓")  } fetched ${name}`);
    return payload;
  } catch {
    s.stop(`${pc.red("✗")  } ${name} not found in registry`);
    process.exit(1);
  }
}

async function writeFileSafely(file, cwd, options) {
  const targetPath = path.join(cwd, file.path);
  if (existsSync(targetPath) && !options.overwrite) {
    const overwrite = await p.confirm({
      initialValue: false,
      message: `${file.path} already exists. Overwrite?`,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.log.info(`skipped ${file.path}`);
      return;
    }
  }
  await mkdir(path.dirname(targetPath), { recursive: true });
  const output =
    file.encoding === "base64"
      ? Buffer.from(file.content, "base64")
      : file.content.replaceAll('\r\n', "\n");
  await writeFile(targetPath, output);
  p.log.success(file.path);
}

export async function add(componentName, options) {
  p.intro(`${pc.dim("frakment")  } add ${pc.bold(componentName)}`);

  let cwd;
  try {
    cwd = findProjectRoot(process.cwd());
  } catch (error) {
    p.outro(pc.red("error ") + error.message);
    process.exit(1);
  }

  const configPath = path.join(cwd, "components.json");
  if (!existsSync(configPath)) {
    p.outro(
      `${pc.red("error ") 
        }components.json not found. Run \`frakment init\` first.`
    );
    process.exit(1);
  }

  const configRaw = await readFile(configPath, "utf-8");
  const config = JSON.parse(configRaw.replace(/^\uFEFF/, ""));
  const registryUrl = (options.registry ?? config.registry).replace(/\/$/, "");
  const s = p.spinner();

  // 1. Recursively fetch the component and its registryDependencies
  const queue = [componentName];
  const fetched = new Map();
  const npmDeps = new Set();

  while (queue.length) {
    const name = queue.shift();
    if (fetched.has(name)) {continue;}
    const payload = await fetchComponent(name, registryUrl, s);
    fetched.set(name, payload);
    for (const d of payload.dependencies ?? []) {npmDeps.add(d);}
    for (const d of payload.registryDependencies ?? []) {
      if (!fetched.has(d)) {queue.push(d);}
    }
  }

  // 2. Write registry deps first (imports resolve), then main component
  const order = [...fetched.keys()].filter((n) => n !== componentName);
  order.push(componentName);
  for (const name of order) {
    for (const file of fetched.get(name).files ?? []) {
      await writeFileSafely(file, cwd, options);
    }
  }

  // 3. Install npm dependencies
  if (npmDeps.size > 0) {
    const pkgPath = path.join(cwd, "package.json");
    const pkgRaw = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/, ""));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const missing = [...npmDeps].filter((d) => !allDeps[d]);
    if (missing.length > 0) {
      s.start(`installing ${missing.join(", ")}`);
      const pm = detectPackageManager(cwd);
      try {
        const args =
          pm === "npm" ? ["install", ...missing] : ["add", ...missing];
        await execa(pm, args, { cwd, stdio: "ignore" });
        s.stop(`${pc.green("✓")  } installed ${missing.length} package(s)`);
      } catch (error) {
        s.stop(pc.red("✗") + " failed to install dependencies");
        p.log.warn(error.message);
      }
    }
  }

  p.outro(`${pc.green("✓")} ${componentName} added`);
}
