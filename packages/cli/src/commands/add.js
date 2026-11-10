import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import prompts from "prompts";

import { detectPackageManager, findProjectRoot } from "../utils/detect.js";
import { logger } from "../utils/logger.js";

const COMPONENT_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const DEPENDENCY_PATTERN =
  /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*(?:@[0-9A-Za-z*~^<>=|.+_-]+)?$/u;
const MAX_REGISTRY_PAYLOAD_BYTES = 10 * 1024 * 1024;

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const canonicalize = (value) => {
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

const createIntegrity = (payload) =>
  `sha256:${createHash("sha256")
    .update(canonicalize(payload), "utf8")
    .digest("hex")}`;

const assertComponentName = (name) => {
  if (typeof name !== "string" || !COMPONENT_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid component name: ${String(name)}`);
  }
};

const assertDependency = (dependency) => {
  if (typeof dependency !== "string" || !DEPENDENCY_PATTERN.test(dependency)) {
    throw new Error(
      `Invalid dependency in registry payload: ${String(dependency)}`
    );
  }
};

const getDependencyName = (dependency) => {
  if (dependency.startsWith("@")) {
    return dependency.slice(0, dependency.indexOf("@", 1));
  }
  return dependency.split("@")[0];
};

const hasDependencyVersion = (dependency) =>
  dependency.lastIndexOf("@") > (dependency.startsWith("@") ? 0 : -1);

const isBase64 = (value) =>
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(
    value
  );

export const validateRegistryPayload = (payload, expectedName) => {
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
  for (const dependency of payload.dependencies ?? []) {
    assertDependency(dependency);
  }
  for (const dependency of payload.registryDependencies ?? []) {
    assertComponentName(dependency);
  }

  const { integrity, ...unsignedPayload } = payload;
  if (integrity !== createIntegrity(unsignedPayload)) {
    throw new Error("Registry payload integrity check failed");
  }

  return payload;
};

const getRegistryUrl = (value) => {
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

async function fetchComponent(name, registryUrl, spinner) {
  try {
    const res = await fetch(`${registryUrl}/${name}.json`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const contentLength = Number(res.headers.get("content-length"));
    if (contentLength > MAX_REGISTRY_PAYLOAD_BYTES) {
      throw new Error("Registry response is too large");
    }
    const raw = await res.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_REGISTRY_PAYLOAD_BYTES) {
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

export async function assertSafePath(cwd, relativePath) {
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

async function writeFileSafely(file, cwd, options) {
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

  let config;
  let registryUrl;
  try {
    assertComponentName(componentName);
    const configRaw = await readFile(configPath, "utf-8");
    config = JSON.parse(configRaw.replace(/^\uFEFF/u, ""));
    registryUrl = getRegistryUrl(options.registry ?? config.registry);
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Invalid configuration."
    );
    process.exit(1);
  }

  const registrySpinner = ora("Checking registry").start();
  const queue = [componentName];
  const fetched = new Map();
  const npmDeps = new Map();

  while (queue.length) {
    const name = queue.shift();
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

  const getMissingDependencies = async () => {
    const pkgPath = path.join(cwd, "package.json");
    const pkgRaw = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw.replace(/^\uFEFF/u, ""));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    return [...npmDeps].filter(([packageName]) => !allDeps[packageName]);
  };

  if (options.dryRun) {
    for (const name of order) {
      for (const file of fetched.get(name).files) {
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
    const missing = await getMissingDependencies();
    if (missing.length > 0) {
      if (options.skipDependencies) {
        logger.info(`Skipped ${missing.length} dependency installation(s).`);
        logger.break();
        return;
      }
      const s = ora("Installing dependencies").start();
      const pm = detectPackageManager(cwd);
      try {
        const args =
          pm === "npm"
            ? ["install", ...missing.map(([, dependency]) => dependency)]
            : ["add", ...missing.map(([, dependency]) => dependency)];
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
