import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import prompts from "prompts";

import {
  detectGlobalsCss,
  detectPackageManager,
  findProjectRoot,
} from "../utils/detect.js";
import { logger } from "../utils/logger.js";

const __dirname = import.meta.dirname;
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");

const DEFAULT_REGISTRY = "https://www.arrafi.dev/frakment/r";
const CONFIG_FILE = "components.json";
const THEME_MARKER_START = "/* ==== FRAKMENT THEME START ==== */";
const THEME_MARKER_END = "/* ==== FRAKMENT THEME END ==== */";

function escapeRegex(s) {
  return s.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export async function init() {
  let cwd;
  const preflight = ora("Preflight checks").start();
  try {
    cwd = findProjectRoot(process.cwd());
    preflight.succeed("Preflight checks. Found project root.");
  } catch (error) {
    preflight.fail(error.message);
    process.exit(1);
  }

  const cssPath = detectGlobalsCss(cwd);
  const cssFullPath = path.join(cwd, cssPath);
  const cssCheck = ora("Verifying Tailwind CSS config").start();
  if (!existsSync(cssFullPath)) {
    cssCheck.fail(`CSS file not found: ${cssPath}`);
    logger.error("Frakment needs an existing Tailwind v4 entry file.");
    process.exit(1);
  }
  let css = await readFile(cssFullPath, "utf-8");
  css = css.replace(/^\uFEFF/u, "");
  if (!/^@import\s+["']tailwindcss(\/|["'])/mu.test(css)) {
    cssCheck.fail("Frakment requires Tailwind v4.");
    logger.error(`Could not find @import "tailwindcss" in ${cssPath}`);
    process.exit(1);
  }
  cssCheck.succeed(
    `Verifying Tailwind CSS config. Found ${chalk.cyan("v4")} in ${chalk.cyan(cssPath)}.`
  );

  const configPath = path.join(cwd, CONFIG_FILE);
  const configExists = existsSync(configPath);
  let shouldWriteConfig = !configExists;
  if (configExists) {
    const { overwrite } = await prompts({
      initial: false,
      message: `${CONFIG_FILE} already exists. Overwrite?`,
      name: "overwrite",
      type: "confirm",
    });
    if (overwrite === undefined) {
      logger.break();
      logger.info("Cancelled.");
      process.exit(0);
    }
    shouldWriteConfig = overwrite === true;
    if (!shouldWriteConfig) {
      logger.break();
      logger.info(`Keeping existing ${CONFIG_FILE}.`);
    }
  }

  if (shouldWriteConfig) {
    const s = ora("Writing components.json").start();
    const template = JSON.parse(
      await readFile(path.join(TEMPLATES_DIR, "components.json"), "utf-8")
    );
    const config = {
      ...template,
      registry: DEFAULT_REGISTRY,
      tailwind: { ...template.tailwind, css: cssPath },
    };
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    s.succeed("Writing components.json.");
  }
  const themeSpinner = ora("Updating CSS variables").start();
  css = css.replaceAll(
    new RegExp(
      `\\n*${escapeRegex(THEME_MARKER_START)}[\\s\\S]*?${escapeRegex(THEME_MARKER_END)}\\n*`,
      "g"
    ),
    "\n"
  );
  css = css.replaceAll(/^@import\s+["']\.\/theme\.css["'];?\s*$\n?/gmu, "");
  css = `${css.replaceAll(/\n{3,}/gu, "\n\n").trimEnd()}\n`;

  const themeContent = await readFile(
    path.join(TEMPLATES_DIR, "theme.css"),
    "utf-8"
  );
  const wrapped = `${THEME_MARKER_START}\n${themeContent.trim()}\n${THEME_MARKER_END}`;

  const importMatches = [...css.matchAll(/^@import\s+[^;\n]+;\s*$/gmu)];
  if (importMatches.length > 0) {
    const lastMatch = importMatches.at(-1);
    const insertAt = lastMatch.index + lastMatch[0].length;
    css = `${css.slice(0, insertAt)}\n\n${wrapped}${css.slice(insertAt)}`;
  } else {
    css = `${css.trimEnd()}\n\n${wrapped}\n`;
  }
  await writeFile(cssFullPath, css);
  themeSpinner.succeed(`Updating CSS variables in ${cssPath}`);
  if (!existsSync(path.join(cwd, "lib/utils.ts"))) {
    const s = ora("Creating lib/utils.ts").start();
    await mkdir(path.join(cwd, "lib"), { recursive: true });
    await writeFile(
      path.join(cwd, "lib/utils.ts"),
      `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`
    );
    s.succeed("Created 1 file:");
    logger.log("  - lib/utils.ts");
  }

  if (!existsSync(path.join(cwd, "lib/animation.ts"))) {
    const s = ora("Creating lib/animation.ts").start();
    await mkdir(path.join(cwd, "lib"), { recursive: true });
    await writeFile(
      path.join(cwd, "lib/animation.ts"),
      `export const SPRING_SMOOTH = { type: "spring", stiffness: 200, damping: 30 } as const

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_SMOOTH = [0.32, 0.72, 0, 1] as const
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const

export const DURATION_FAST = 0.2
export const DURATION_SMOOTH = 0.45
`
    );
    s.succeed("Created 1 file:");
    logger.log("  - lib/animation.ts");
  }
  const pkgPath = path.join(cwd, "package.json");
  const pkgRaw = await readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/u, ""));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = [
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
    "radix-ui",
    "lucide-react",
    "motion",
  ].filter((d) => !allDeps[d]);

  if (missing.length > 0) {
    const s = ora("Installing dependencies").start();
    const pm = detectPackageManager(cwd);
    try {
      const args = pm === "npm" ? ["install", ...missing] : ["add", ...missing];
      await execa(pm, args, { cwd, stdio: "ignore" });
      s.succeed(`Installed ${missing.length} package(s).`);
    } catch (error) {
      s.fail("Failed to install dependencies.");
      logger.warn(error.message);
    }
  }

  logger.break();
  logger.log(
    `${chalk.green("Success!")} Project initialization completed. You may now add components.`
  );
  logger.break();
}
