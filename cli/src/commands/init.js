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
  if (existsSync(configPath)) {
    const overwrite = await p.confirm({
      message: `${CONFIG_FILE} already exists. Reconfigure?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.outro(pc.dim("cancelled"));
      return;
    }
  }

  const s = p.spinner();

  // 1. components.json
  s.start("writing components.json");
  const template = JSON.parse(
    await readFile(path.join(TEMPLATES_DIR, "components.json"), "utf8")
  );
  const cssPath = detectGlobalsCss(cwd);
  const config = {
    ...template,
    registry: DEFAULT_REGISTRY,
    tailwind: { ...template.tailwind, css: cssPath },
  };
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
  s.stop(pc.green("✓") + " components.json");

  // 2. theme
  const cssFullPath = path.join(cwd, cssPath);
  if (existsSync(cssFullPath)) {
    s.start("injecting theme tokens");
    const themeContent = await readFile(
      path.join(TEMPLATES_DIR, "theme.css"),
      "utf8"
    );
    let css = await readFile(cssFullPath, "utf8");
    const wrapped = `${THEME_MARKER_START}\n${themeContent.trim()}\n${THEME_MARKER_END}`;
    if (css.includes(THEME_MARKER_START)) {
      const re = new RegExp(
        `${escapeRegex(THEME_MARKER_START)}[\\s\\S]*?${escapeRegex(THEME_MARKER_END)}`
      );
      css = css.replace(re, wrapped);
    } else {
      css = css.trimEnd() + "\n\n" + wrapped + "\n";
    }
    await writeFile(cssFullPath, css);
    s.stop(pc.green("✓") + " theme tokens");
  } else {
    p.log.warn(`CSS file not found: ${cssPath}`);
  }

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
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
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