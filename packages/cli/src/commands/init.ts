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
} from "../utils/detect.ts";
import { logger } from "../utils/logger.ts";

const __dirname = import.meta.dirname;
const templatesDir = path.resolve(__dirname, "../../templates");

const defaultRegistry = "https://www.arrafi.dev/frakment/r";
const configFile = "components.json";
const themeMarkerStart = "/* ==== FRAKMENT THEME START ==== */";
const themeMarkerEnd = "/* ==== FRAKMENT THEME END ==== */";

function escapeRegex(s: string): string {
  return s.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

async function initExpo() {
  let cwd: string;
  const preflight = ora("Expo preflight checks").start();

  try {
    cwd = findProjectRoot(process.cwd());
  } catch (error) {
    preflight.fail(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }

  const pkgPath = path.join(cwd, "package.json");
  let pkg: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  try {
    const raw = await readFile(pkgPath, "utf-8");
    pkg = JSON.parse(raw.replace(/^\uFEFF/u, ""));
  } catch (error) {
    preflight.fail("Could not read package.json.");
    logger.error(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const required = ["expo", "react-native", "nativewind", "tailwindcss"];
  const missingFramework = required.filter((name) => !allDeps[name]);

  if (missingFramework.length > 0) {
    preflight.fail("Expo project prerequisites are missing.");
    logger.error(
      "frakment init --expo requires Expo, React Native, NativeWind, and Tailwind CSS."
    );
    logger.info(`Missing: ${missingFramework.join(", ")}`);
    process.exit(1);
  }

  preflight.succeed("Found Expo + React Native + NativeWind project.");

  const cssCandidates = [
    "global.css",
    "app/global.css",
    "src/global.css",
    "src/app/global.css",
    "styles/global.css",
  ];

  const cssPath = cssCandidates.find((candidate) =>
    existsSync(path.join(cwd, candidate))
  );

  if (!cssPath) {
    logger.error(
      "Could not find the NativeWind stylesheet, for example global.css."
    );
    process.exit(1);
  }

  const css = (await readFile(path.join(cwd, cssPath), "utf-8")).replace(
    /^\uFEFF/u,
    ""
  );

  if (!/@import\s+["']nativewind\/theme["'];?/u.test(css)) {
    logger.error(
      "The stylesheet must import nativewind/theme. Configure NativeWind first."
    );
    process.exit(1);
  }

  const configPath = path.join(cwd, configFile);
  let shouldWriteConfig = !existsSync(configPath);

  if (!shouldWriteConfig) {
    const { overwrite } = await prompts({
      initial: false,
      message: `${configFile} already exists. Overwrite?`,
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
      logger.info(`Keeping existing ${configFile}.`);
    }
  }

  if (shouldWriteConfig) {
    const spinner = ora("Writing Expo components.json").start();
    const templatePath = path.join(templatesDir, "expo", configFile);
    const templateRaw = await readFile(templatePath, "utf-8");
    const template = JSON.parse(templateRaw.replace(/^\uFEFF/u, ""));

    if (template.platform !== "expo" || !template.registries?.expo) {
      spinner.fail("Expo CLI template is missing its Expo registry.");
      process.exit(1);
    }

    const config = {
      ...template,
      registry: template.registries.web ?? defaultRegistry,
      tailwind: { ...template.tailwind, css: cssPath },
    };

    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    spinner.succeed(`Created ${configFile}.`);
  }

  for (const name of ["utils.ts", "theme.ts"]) {
    const target = path.join(cwd, "lib", name);

    if (existsSync(target)) {
      logger.info(`Keeping existing lib/${name}.`);
      continue;
    }

    const source = path.join(templatesDir, "expo", "lib", name);
    const content = await readFile(source, "utf-8");

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);

    logger.log(`Created lib/${name}.`);
  }

  const baseDependencies = [
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
  ];

  const missing = baseDependencies.filter((name) => !allDeps[name]);

  if (missing.length > 0) {
    const spinner = ora("Installing Expo dependencies").start();

    try {
      await execa("npx", ["expo", "install", ...missing], {
        cwd,
        stdio: "ignore",
      });
      spinner.succeed(`Installed ${missing.length} package(s).`);
    } catch (error) {
      spinner.fail("Failed to install Expo dependencies.");
      logger.warn(error instanceof Error ? error.message : "Unknown error");
    }
  }

  logger.break();
  logger.log(
    chalk.green("Success!") +
      " Expo initialization completed. Use frakment add <component> --expo for native components."
  );
  logger.break();
}

export async function init(options: { expo?: boolean } = {}) {
  if (options.expo) {
    await initExpo();
    return;
  }
  let cwd: string;
  const preflight = ora("Preflight checks").start();
  try {
    cwd = findProjectRoot(process.cwd());
    preflight.succeed("Preflight checks. Found project root.");
  } catch (error) {
    preflight.fail(error instanceof Error ? error.message : "Unknown error");
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

  const configPath = path.join(cwd, configFile);
  const configExists = existsSync(configPath);
  let shouldWriteConfig = !configExists;
  if (configExists) {
    const { overwrite } = await prompts({
      initial: false,
      message: `${configFile} already exists. Overwrite?`,
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
      logger.info(`Keeping existing ${configFile}.`);
    }
  }

  if (shouldWriteConfig) {
    const s = ora("Writing components.json").start();
    const template = JSON.parse(
      await readFile(path.join(templatesDir, "components.json"), "utf-8")
    );
    const config = {
      ...template,
      registry: defaultRegistry,
      tailwind: { ...template.tailwind, css: cssPath },
    };
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    s.succeed("Writing components.json.");
  }
  const themeSpinner = ora("Updating CSS variables").start();
  css = css.replaceAll(
    new RegExp(
      `\\n*${escapeRegex(themeMarkerStart)}[\\s\\S]*?${escapeRegex(themeMarkerEnd)}\\n*`,
      "g"
    ),
    "\n"
  );
  css = css.replaceAll(/^@import\s+["']\.\/theme\.css["'];?\s*$\n?/gmu, "");
  css = `${css.replaceAll(/\n{3,}/gu, "\n\n").trimEnd()}\n`;

  const themeContent = await readFile(
    path.join(templatesDir, "theme.css"),
    "utf-8"
  );
  const wrapped = `${themeMarkerStart}\n${themeContent.trim()}\n${themeMarkerEnd}`;

  const importMatches = [...css.matchAll(/^@import\s+[^;\n]+;\s*$/gmu)];
  if (importMatches.length > 0) {
    const lastMatch = importMatches.at(-1);
    if (lastMatch?.index === undefined) {
      css = `${css.trimEnd()}\n\n${wrapped}\n`;
    } else {
      const insertAt = lastMatch.index + lastMatch[0].length;
      css = `${css.slice(0, insertAt)}\n\n${wrapped}${css.slice(insertAt)}`;
    }
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

  if (existsSync(path.join(cwd, "lib/motion.ts"))) {
  } else {
    const s = ora("Creating lib/motion.ts").start();
    await mkdir(path.join(cwd, "lib"), { recursive: true });
    const motion = await readFile(
      path.join(templatesDir, "lib/motion.ts"),
      "utf-8"
    );
    await writeFile(path.join(cwd, "lib/motion.ts"), motion);
    s.succeed("Created 1 file:");
    logger.log("  - lib/motion.ts");
  }

  const pkgPath = path.join(cwd, "package.json");
  const pkgRaw = await readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/u, ""));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = [
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
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
      logger.warn(error instanceof Error ? error.message : "Unknown error");
    }
  }

  logger.break();
  logger.log(
    `${chalk.green("Success!")} Project initialization completed. You may now add components.`
  );
  logger.break();
}
