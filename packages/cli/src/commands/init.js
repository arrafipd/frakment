import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import * as p from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

import {
  detectGlobalsCss,
  detectPackageManager,
  findProjectRoot,
} from "../utils/detect.js";

const __dirname = import.meta.dirname;
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");

const DEFAULT_REGISTRY = "https://frakment.vercel.app/r";
const CONFIG_FILE = "components.json";
const THEME_MARKER_START = "/* ==== FRAKMENT THEME START ==== */";
const THEME_MARKER_END = "/* ==== FRAKMENT THEME END ==== */";

export async function init() {
  p.intro(`${pc.dim("frakment")} init`);

  let cwd;
  try {
    cwd = findProjectRoot(process.cwd());
  } catch (error) {
    p.outro(pc.red("error ") + error.message);
    process.exit(1);
  }

  const configPath = path.join(cwd, CONFIG_FILE);
  const configExists = existsSync(configPath);
  let shouldWriteConfig = !configExists;

  if (configExists) {
    const overwrite = await p.confirm({
      initialValue: false,
      message: `${CONFIG_FILE} already exists. Overwrite?`,
    });
    if (p.isCancel(overwrite)) {
      p.outro(pc.dim("cancelled"));
      return;
    }
    if (overwrite) {
      shouldWriteConfig = true;
    } else {
      p.log.info(`keeping existing ${CONFIG_FILE}`);
    }
  }

  const s = p.spinner();
  const cssPath = detectGlobalsCss(cwd);

  // 1. components.json (write only if new or user chose to overwrite)
  if (shouldWriteConfig) {
    s.start("writing components.json");
    const template = JSON.parse(
      await readFile(path.join(TEMPLATES_DIR, "components.json"), "utf-8")
    );
    const config = {
      ...template,
      registry: DEFAULT_REGISTRY,
      tailwind: { ...template.tailwind, css: cssPath },
    };
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    s.stop(`${pc.green("✓")} components.json`);
  }

  // 2. theme (inline block)
  const cssFullPath = path.join(cwd, cssPath);
  if (!existsSync(cssFullPath)) {
    p.log.error(`CSS file not found: ${cssPath}`);
    p.outro(
      `${pc.red(
        "error "
      )}Could not find globals.css. Frakment needs an existing Tailwind v4 entry file.`
    );
    process.exit(1);
  }

  let css = await readFile(cssFullPath, "utf-8");
  css = css.replace(/^\uFEFF/u, "");

  if (!/^@import\s+["']tailwindcss(\/|["'])/mu.test(css)) {
    p.outro(
      `${pc.red(
        "error "
      )}Frakment requires Tailwind v4. Could not find @import "tailwindcss" in ${
        cssPath
      }`
    );
    process.exit(1);
  }

  // Cleanup: strip any prior theme block (marker-bounded) and
  // any split-approach @import "./theme.css" line.
  css = css.replaceAll(
    new RegExp(
      `\\n*${escapeRegex(THEME_MARKER_START)}[\\s\\S]*?${escapeRegex(THEME_MARKER_END)}\\n*`,
      "g"
    ),
    "\n"
  );
  css = css.replaceAll(/^@import\s+["']\.\/theme\.css["'];?\s*$\n?/gmu, "");
  css = `${css.replaceAll(/\n{3,}/gu, "\n\n").trimEnd()}\n`;

  // Inject fresh theme block right after the last top-level @import
  s.start("injecting theme block");
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
  s.stop(`${pc.green("✓")} theme block`);

  // 3. lib/utils.ts
  if (!existsSync(path.join(cwd, "lib/utils.ts"))) {
    s.start("creating lib/utils.ts");
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
    s.stop(`${pc.green("✓")} lib/utils.ts`);
  }

  // 3b. lib/animation.ts
  if (!existsSync(path.join(cwd, "lib/animation.ts"))) {
    s.start("creating lib/animation.ts");
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
    s.stop(`${pc.green("✓")} lib/animation.ts`);
  }

  // 4. dependencies
  const pkgPath = path.join(cwd, "package.json");
  const pkgRaw = await readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/u, ""));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = [
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
    "radix-ui",
    "@phosphor-icons/react",
    "motion",
  ].filter((d) => !allDeps[d]);

  if (missing.length > 0) {
    s.start(`installing ${missing.join(", ")}`);
    const pm = detectPackageManager(cwd);
    try {
      const args = pm === "npm" ? ["install", ...missing] : ["add", ...missing];
      await execa(pm, args, { cwd, stdio: "ignore" });
      s.stop(`${pc.green("✓")} installed ${missing.length} package(s)`);
    } catch (error) {
      s.stop(`${pc.red("✗")} failed to install dependencies`);
      p.log.warn(error.message);
    }
  }

  p.outro(
    `${pc.green("✓")} frakment is ready\n\n` +
      `  Next  ${pc.cyan("frakment add status-chip")}`
  );
}

function escapeRegex(s) {
  return s.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
