import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import chalk from "chalk";
import ora from "ora";

import { findProjectRoot } from "../utils/detect.js";
import { logger } from "../utils/logger.js";

export async function list(options) {
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

  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const registryUrl = (options.registry ?? config.registry).replace(/\/$/u, "");
  const s = ora("Fetching components").start();

  let index;
  try {
    const res = await fetch(`${registryUrl}/index.json`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    index = await res.json();
  } catch {
    s.fail("Failed to fetch component list.");
    process.exit(1);
  }
  s.succeed(`Found ${index.components.length} component(s).`);

  if (!index.components.length) {
    logger.break();
    logger.log(chalk.dim("No components available yet."));
    return;
  }

  const nameWidth = Math.max(...index.components.map((c) => c.name.length));
  logger.break();
  for (const c of index.components) {
    logger.log(
      `  ${chalk.cyan(c.name.padEnd(nameWidth))}  ${chalk.dim(c.description ?? "")}`
    );
  }
  logger.break();
  logger.log(`Add one with ${chalk.cyan("frakment add <name>")}`);
  logger.break();
}
