import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as p from "@clack/prompts";
import pc from "picocolors";
import { execa } from "execa";

import {
  detectGlobalsCss,
  detectPackageManager,
  findProjectRoot,
} from "../utils/detect.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");

const DEFAULT_REGISTRY = "https://frakment.vercel.app/r";
const CONFIG_FILE = "components.json";
const THEME_MARKER_START = "/* ==== FRAKMENT THEME START ==== */";
const THEME_MARKER_END = "/* ==== FRAKMENT THEME END ==== */";

export async function init() {
  p.intro(pc.dim("frakment") + " init");

  let cwd;
  try {
    cwd = findProjectRoot(process.cwd());
  } catch (err) {
    p.outro(pc.red("error ") + err.message);
    process.exit(1);
  }

  const configPath = path.join(cwd, CONFIG_FILE);
  const configExists = existsSync(configPath);
  let shouldWriteConfig = !configExists;

  if (configExists) {
    const overwrite = await p.confirm({
      message: `${CONFIG_FILE} already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite)) {
      p.outro(pc.dim("cancelled"));
      return;
    }
    if (!overwrite) {
      p.log.info(`keeping existing ${CONFIG_FILE}`);
    } else {
      shouldWriteConfig = true;
    }
  }

  const s = p.spinner();
  const cssPath = detectGlobalsCss(cwd);

  // 1. components.json (write only if new or user chose to overwrite)
  if (shouldWriteConfig) {
    s.start("writing components.json");
    const template = JSON.parse(
      await readFile(path.join(TEMPLATES_DIR, "components.json"), "utf8")
    );
    const config = {
      ...template,
      registry: DEFAULT_REGISTRY,
      tailwind: { ...template.tailwind, css: cssPath },
    };
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
    s.stop(pc.green("✓") + " components.json");
  }

  // 2. theme
  const cssFullPath = path.join(cwd, cssPath);
  if (!existsSync(cssFullPath)) {
    p.log.error(`CSS file not found: ${cssPath}`);
    p.outro(
      pc.red("error ") +
        "Could not find globals.css. Frakment needs an existing Tailwind v4 entry file."
    );
    process.exit(1);
  }

  let css = await readFile(cssFullPath, "utf8");
  // Strip UTF-8 BOM if present (Windows editors and some tools add it)
  css = css.replace(/^\uFEFF/, "");
  if (!/^@import\s+["']tailwindcss(\/|["'])/m.test(css)) {
    p.outro(
      pc.red("error ") +
        'Frakment requires Tailwind v4. Could not find @import "tailwindcss" in ' +
        cssPath
    );
    process.exit(1);
  }

  // Migration: strip legacy inline theme block from previous init versions
  if (css.includes(THEME_MARKER_START)) {
    const legacyRe = new RegExp(
      `\\n*${escapeRegex(THEME_MARKER_START)}[\\s\\S]*?${escapeRegex(THEME_MARKER_END)}\\n*`,
      "g"
    );
    css = css.replace(legacyRe, "\n").trimEnd() + "\n";
  }

  // 2a. Write theme.css next to globals.css
  s.start("writing theme.css");
  const themeContent = await readFile(
    path.join(TEMPLATES_DIR, "theme.css"),
    "utf8"
  );
  const themePath = path.join(path.dirname(cssFullPath), "theme.css");
  await writeFile(themePath, themeContent);
  s.stop(pc.green("✓") + " theme.css");

  // 2b. Inject @import "./theme.css"; after @import "tailwindcss"
  s.start("injecting theme import");
  const importLine = '@import "./theme.css";';
  if (!new RegExp(`^${escapeRegex(importLine)}`, "m").test(css)) {
    const tailwindLineRe = /^@import\s+["']tailwindcss(\/|["'])[^;\n]*;\s*$/m;
    css = tailwindLineRe.test(css)
      ? css.replace(tailwindLineRe, (match) => `${match}\n${importLine}`)
      : `${importLine}\n${css}`;
    await writeFile(cssFullPath, css);
  }
  s.stop(pc.green("✓") + " theme import");

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
    s.stop(pc.green("✓") + " lib/utils.ts");
  }

  // 4. dependencies
  const pkgPath = path.join(cwd, "package.json");
  const pkgRaw = await readFile(pkgPath, "utf8");
  const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/, ""));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = ["clsx", "tailwind-merge", "class-variance-authority", "radix-ui", "lucide-react", "motion"].filter((d) => !allDeps[d]);

  if (missing.length > 0) {
    s.start(`installing ${missing.join(", ")}`);
    const pm = detectPackageManager(cwd);
    try {
      const args = pm === "npm" ? ["install", ...missing] : ["add", ...missing];
      await execa(pm, args, { cwd, stdio: "ignore" });
      s.stop(pc.green("✓") + ` installed ${missing.length} package(s)`);
    } catch (err) {
      s.stop(pc.red("✗") + " failed to install dependencies");
      p.log.warn(err.message);
    }
  }

  p.outro(
    `${pc.green("✓")} frakment is ready\n\n` +
      `  Next  ${pc.cyan("frakment add status-chip")}`
  );
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}