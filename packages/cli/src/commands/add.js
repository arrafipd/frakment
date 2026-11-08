import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import prompts from "prompts";

import { detectPackageManager, findProjectRoot } from "../utils/detect.js";
import { logger } from "../utils/logger.js";

async function fetchComponent(name, registryUrl, spinner) {
  try {
    const res = await fetch(`${registryUrl}/${name}.json`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = await res.json();
    spinner.text = `Fetching ${name}...`;
    return payload;
  } catch {
    spinner.fail(`Registry fetch failed for ${name}.`);
    process.exit(1);
  }
}
async function writeFileSafely(file, cwd, options) {
  const targetPath = path.join(cwd, file.path);
  if (existsSync(targetPath) && !options.overwrite) {
    const { overwrite } = await prompts({
      initial: false,
      message: `${file.path} already exists. Overwrite?`,
      name: "overwrite",
      type: "confirm",
    });
    if (overwrite === undefined || !overwrite) {
      logger.info(`Skipped ${file.path}.`);
      return null;
    }
  }
  await mkdir(path.dirname(targetPath), { recursive: true });
  const output =
    file.encoding === "base64"
      ? Buffer.from(file.content, "base64")
      : file.content.replaceAll("\r\n", "\n");
  await writeFile(targetPath, output);
  return file.path;
}

export async function add(componentName, options) {
  let cwd;
  const preflight = ora("Preflight checks").start();
  try {
    cwd = findProjectRoot(process.cwd());
    preflight.succeed("Preflight checks. Found project root.");
  } catch (error) {
    preflight.fail(error.message);
    process.exit(1);
  }
  const configPath = path.join(cwd, "components.json");
  if (!existsSync(configPath)) {
    logger.error(`${chalk.red("Error:")} components.json not found.`);
    logger.info("Run `frakment init` first.");
    process.exit(1);
  }

  const configRaw = await readFile(configPath, "utf-8");
  const config = JSON.parse(configRaw.replace(/^\uFEFF/u, ""));
  const registryUrl = (options.registry ?? config.registry).replace(/\/$/u, "");

  const registrySpinner = ora("Checking registry").start();
  const queue = [componentName];
  const fetched = new Map();
  const npmDeps = new Set();

  while (queue.length) {
    const name = queue.shift();
    if (fetched.has(name)) {
      continue;
    }
    const payload = await fetchComponent(name, registryUrl, registrySpinner);
    fetched.set(name, payload);
    for (const d of payload.dependencies ?? []) {
      npmDeps.add(d);
    }
    for (const d of payload.registryDependencies ?? []) {
      if (!fetched.has(d)) {
        queue.push(d);
      }
    }
  }
  registrySpinner.succeed("Checking registry.");
  const isSrcLayout = config.tailwind?.css?.startsWith("src/") ?? false;
  const resolveTargetPath = (p) => {
    if (!isSrcLayout) {
      return p;
    }
    if (p.startsWith("public/")) {
      return p;
    }
    return `src/${p}`;
  };

  const order = [...fetched.keys()].filter((n) => n !== componentName);
  order.push(componentName);
  const written = [];

  for (const name of order) {
    for (const file of fetched.get(name).files ?? []) {
      const targetFile = { ...file, path: resolveTargetPath(file.path) };
      const result = await writeFileSafely(targetFile, cwd, options);
      if (result) {
        written.push(result);
      }
    }
  }

  if (written.length > 0) {
    logger.success(
      `Created ${written.length} file${written.length === 1 ? "" : "s"}:`
    );
    for (const p of written) {
      logger.log(`  - ${p}`);
    }
  }
  if (npmDeps.size > 0) {
    const pkgPath = path.join(cwd, "package.json");
    const pkgRaw = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/u, ""));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const missing = [...npmDeps].filter((d) => !allDeps[d]);
    if (missing.length > 0) {
      const s = ora("Installing dependencies").start();
      const pm = detectPackageManager(cwd);
      try {
        const args =
          pm === "npm" ? ["install", ...missing] : ["add", ...missing];
        await execa(pm, args, { cwd, stdio: "ignore" });
        s.succeed(`Installed ${missing.length} package(s).`);
      } catch (error) {
        s.fail("Failed to install dependencies.");
        logger.warn(error.message);
      }
    }
  }

  logger.break();
}
