import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import prompts from "prompts";

import { detectPackageManager, findProjectRoot } from "../utils/detect.ts";
import { logger } from "../utils/logger.ts";

const componentNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const dependencyPattern =
  /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*(?:@[0-9A-Za-z*~^<>=|.+_-]+)?$/u;
const maxRegistryPayloadBytes = 10 * 1024 * 1024;
const defaultWebRegistry = "https://www.arrafi.dev/frakment/r";
const defaultExpoRegistry = "https://www.arrafi.dev/frakment/r/expo";

const defaultAliases = {
  components: "@/components",
  ui: "@/components/ui",
  utils: "@/lib/utils",
};

interface AliasesInput {
  components?: string;
  ui?: string;
  utils?: string;
}

interface ResolvedAliases {
  components: string;
  ui: string;
  utils: string;
}

interface RegistryFile {
  content: string;
  encoding?: "base64";
  path: string;
}

interface RegistryPayload {
  dependencies?: string[];
  files: RegistryFile[];
  integrity: string;
  name: string;
  registryDependencies?: string[];
}

interface RegistryConfig {
  aliases?: AliasesInput;
  registries?: {
    expo?: string;
    web?: string;
  };
  registry?: string;
  tailwind?: {
    css?: string;
  };
}

interface AddOptions {
  dryRun?: boolean;
  expo?: boolean;
  overwrite?: boolean;
  registry?: string;
  skipDependencies?: boolean;
}

interface Spinner {
  fail: (message: string) => void;
  succeed: (message: string) => void;
  text: string;
}

const normalizeAliases = (input: unknown): ResolvedAliases => {
  const aliases = isRecord(input) ? input : {};
  const components = aliases.components ?? defaultAliases.components;
  const ui = aliases.ui ?? `${components}/ui`;
  const utils = aliases.utils ?? defaultAliases.utils;
  return {
    components: String(components),
    ui: String(ui),
    utils: String(utils),
  };
};

export const rewriteImports = (content: string, aliases: unknown): string => {
  const a = normalizeAliases(aliases);
  let out = content;
  out = out.replaceAll("@/components/ui/", `${a.ui}/`);
  out = out.replaceAll("@/components/", `${a.components}/`);
  out = out.replace(/@\/lib\/utils\b/g, a.utils);
  return out;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const canonicalize = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const createIntegrity = (payload: unknown): string =>
  `sha256:${createHash("sha256")
    .update(canonicalize(payload), "utf8")
    .digest("hex")}`;

function assertComponentName(name: unknown): asserts name is string {
  if (typeof name !== "string" || !componentNamePattern.test(name)) {
    throw new Error(`Invalid component name: ${String(name)}`);
  }
}

function assertDependency(dependency: unknown): asserts dependency is string {
  if (typeof dependency !== "string" || !dependencyPattern.test(dependency)) {
    throw new Error(
      `Invalid dependency in registry payload: ${String(dependency)}`
    );
  }
}

const getDependencyName = (dependency: string): string => {
  if (dependency.startsWith("@")) {
    return dependency.slice(0, dependency.indexOf("@", 1));
  }
  return dependency.split("@")[0];
};

const hasDependencyVersion = (dependency: string): boolean =>
  dependency.lastIndexOf("@") > (dependency.startsWith("@") ? 0 : -1);

const isBase64 = (value: string): boolean =>
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(
    value
  );

export const validateRegistryPayload = (
  payload: unknown,
  expectedName: string
): RegistryPayload => {
  if (!isRecord(payload) || payload.name !== expectedName) {
    throw new Error("Registry payload has an unexpected component name");
  }
  if (
    typeof payload.integrity !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(payload.integrity)
  ) {
    throw new Error("Registry payload has invalid integrity metadata");
  }
  if (!Array.isArray(payload.files) || payload.files.length === 0) {
    throw new Error("Registry payload must include at least one file");
  }
  if (payload.files.length > 100) {
    throw new Error("Registry payload has too many files");
  }

  for (const file of payload.files) {
    if (!isRecord(file) || typeof file.path !== "string") {
      throw new Error("Registry payload contains an invalid file");
    }
    if (typeof file.content !== "string") {
      throw new Error(`Registry file ${file.path} has invalid content`);
    }
    if (file.encoding !== undefined && file.encoding !== "base64") {
      throw new Error(`Registry file ${file.path} has an unsupported encoding`);
    }
    if (file.encoding === "base64" && !isBase64(file.content)) {
      throw new Error(`Registry file ${file.path} has invalid base64 content`);
    }
  }

  if (
    !(
      Array.isArray(payload.dependencies ?? []) &&
      Array.isArray(payload.registryDependencies ?? [])
    )
  ) {
    throw new Error("Registry payload has invalid dependency lists");
  }
  const dependencies = Array.isArray(payload.dependencies)
    ? payload.dependencies
    : [];
  const registryDependencies = Array.isArray(payload.registryDependencies)
    ? payload.registryDependencies
    : [];
  for (const dependency of dependencies) {
    assertDependency(dependency);
  }
  for (const dependency of registryDependencies) {
    assertComponentName(dependency);
  }

  const { integrity, ...unsignedPayload } = payload;
  if (integrity !== createIntegrity(unsignedPayload)) {
    throw new Error("Registry payload integrity check failed");
  }

  return payload as unknown as RegistryPayload;
};

const getRegistryUrl = (value: string): string => {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Registry URL must use HTTP or HTTPS");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "Registry URL must not include credentials, a query, or a fragment"
    );
  }
  return url.href.replace(/\/$/u, "");
};

export function resolveRegistryUrl(
  config: unknown,
  options: { expo?: boolean; registry?: string } = {}
): string {
  const configRecord = isRecord(config) ? config : {};
  const registries = isRecord(configRecord.registries)
    ? configRecord.registries
    : {};
  const registry =
    typeof configRecord.registry === "string"
      ? configRecord.registry
      : undefined;
  const web = typeof registries.web === "string" ? registries.web : undefined;
  const expo =
    typeof registries.expo === "string" ? registries.expo : undefined;
  const configured = options.expo
    ? (expo ?? defaultExpoRegistry)
    : (registry ?? web ?? defaultWebRegistry);

  return getRegistryUrl(options.registry ?? configured);
}

async function fetchComponent(
  name: string,
  registryUrl: string,
  spinner: Spinner
): Promise<RegistryPayload> {
  try {
    const res = await fetch(`${registryUrl}/${name}.json`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const contentLength = Number(res.headers.get("content-length"));
    if (contentLength > maxRegistryPayloadBytes) {
      throw new Error("Registry response is too large");
    }
    const raw = await res.text();
    if (Buffer.byteLength(raw, "utf8") > maxRegistryPayloadBytes) {
      throw new Error("Registry response is too large");
    }
    const payload = validateRegistryPayload(JSON.parse(raw), name);
    spinner.text = `Fetching ${name}...`;
    return payload;
  } catch (error) {
    spinner.fail(
      `Registry fetch failed for ${name}: ${error instanceof Error ? error.message : "unknown error"}`
    );
    process.exit(1);
  }
}

export async function assertSafePath(
  cwd: string,
  relativePath: string
): Promise<string> {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("Invalid file path in registry payload");
  }
  if (relativePath.includes("\0")) {
    throw new Error(`Null byte in path: ${relativePath}`);
  }
  if (path.isAbsolute(relativePath) || /^[a-zA-Z]:/.test(relativePath)) {
    throw new Error(`Absolute path rejected: ${relativePath}`);
  }
  if (relativePath.split(/[\\/]/).some((seg) => seg === "..")) {
    throw new Error(`Parent traversal rejected: ${relativePath}`);
  }
  const root = path.resolve(cwd);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error(`Path escapes project root: ${relativePath}`);
  }
  const realRoot = await realpath(root).catch(() => root);
  let existingParent = path.dirname(target);
  while (!existsSync(existingParent)) {
    existingParent = path.dirname(existingParent);
  }
  const realParent = await realpath(existingParent).catch(() => existingParent);
  if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
    throw new Error(`Symlink escape rejected: ${relativePath}`);
  }
  if (existsSync(target) && (await lstat(target)).isSymbolicLink()) {
    throw new Error(`Symlink target rejected: ${relativePath}`);
  }
  return target;
}

async function writeFileSafely(
  file: RegistryFile,
  cwd: string,
  options: AddOptions,
  aliases: unknown
): Promise<string | null> {
  const targetPath = await assertSafePath(cwd, file.path);
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
      : rewriteImports(file.content, aliases).replaceAll("\r\n", "\n");
  await writeFile(targetPath, output);
  return file.path;
}

export async function add(
  componentNamesInput: string[] | string,
  options: AddOptions = {}
) {
  const componentNames = Array.isArray(componentNamesInput)
    ? [...new Set(componentNamesInput)]
    : [componentNamesInput];
  if (componentNames.length === 0) {
    logger.error(
      `${chalk.red("Error:")} At least one component name is required.`
    );
    process.exit(1);
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
  const configPath = path.join(cwd, "components.json");
  if (!existsSync(configPath)) {
    logger.error(`${chalk.red("Error:")} components.json not found.`);
    logger.info("Run `frakment init` first.");
    process.exit(1);
  }

  let config: RegistryConfig;
  let registryUrl: string;
  try {
    for (const name of componentNames) {
      assertComponentName(name);
    }
    const configRaw = await readFile(configPath, "utf-8");
    config = JSON.parse(configRaw.replace(/^\uFEFF/u, "")) as RegistryConfig;
    registryUrl = resolveRegistryUrl(config, options);
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Invalid configuration."
    );
    process.exit(1);
  }

  const registrySpinner = ora("Checking registry").start();
  const roots = new Set(componentNames);
  const queue = [...roots];
  const fetched = new Map<string, RegistryPayload>();
  const npmDeps = new Map<string, string>();

  while (queue.length) {
    const name = queue.shift();
    if (!name) {
      continue;
    }
    if (fetched.has(name)) {
      continue;
    }
    const payload = await fetchComponent(name, registryUrl, registrySpinner);
    fetched.set(name, payload);
    for (const d of payload.dependencies ?? []) {
      const packageName = getDependencyName(d);
      const existing = npmDeps.get(packageName);
      if (
        !existing ||
        (!hasDependencyVersion(existing) && hasDependencyVersion(d))
      ) {
        npmDeps.set(packageName, d);
      }
    }
    for (const d of payload.registryDependencies ?? []) {
      if (!fetched.has(d)) {
        queue.push(d);
      }
    }
  }
  registrySpinner.succeed("Checking registry.");
  const aliases = normalizeAliases(config.aliases);
  const isSrcLayout = config.tailwind?.css?.startsWith("src/") ?? false;
  const resolveTargetPath = (p: string): string => {
    if (!isSrcLayout) {
      return p;
    }
    if (p.startsWith("public/")) {
      return p;
    }
    return `src/${p}`;
  };

  const order = [...fetched.keys()].filter((n) => !roots.has(n));
  order.push(...roots);
  const written: string[] = [];

  const getMissingDependencies = async () => {
    const pkgPath = path.join(cwd, "package.json");
    const pkgRaw = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/u, "")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    return [...npmDeps].filter(([packageName]) => !allDeps[packageName]);
  };

  if (options.dryRun) {
    for (const name of order) {
      for (const file of fetched.get(name)?.files ?? []) {
        const targetPath = resolveTargetPath(file.path);
        await assertSafePath(cwd, targetPath);
        logger.log(`Would create ${targetPath}.`);
      }
    }
    const missing = await getMissingDependencies();
    for (const [, dependency] of missing) {
      logger.log(`Would install ${dependency}.`);
    }
    logger.success("Dry run complete. No files or dependencies were changed.");
    logger.break();
    return;
  }

  for (const name of order) {
    for (const file of fetched.get(name)?.files ?? []) {
      const targetFile = { ...file, path: resolveTargetPath(file.path) };
      const result = await writeFileSafely(targetFile, cwd, options, aliases);
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
    const missing = await getMissingDependencies();
    if (missing.length > 0) {
      if (options.skipDependencies) {
        logger.info(`Skipped ${missing.length} dependency installation(s).`);
        logger.break();
        return;
      }
      const s = ora("Installing dependencies").start();
      const packages = missing.map(([, dependency]) => dependency);
      try {
        if (options.expo) {
          await execa("npx", ["expo", "install", ...packages], {
            cwd,
            stdio: "ignore",
          });
        } else {
          const pm = detectPackageManager(cwd);
          const args =
            pm === "npm" ? ["install", ...packages] : ["add", ...packages];
          await execa(pm, args, { cwd, stdio: "ignore" });
        }
        s.succeed(`Installed ${missing.length} package(s).`);
      } catch (error) {
        s.fail("Failed to install dependencies.");
        logger.warn(error instanceof Error ? error.message : "Unknown error");
      }
    }
  }

  logger.break();
}
