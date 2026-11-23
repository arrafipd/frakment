#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.startsWith("pnpm/");
const scriptName = process.argv[2];
const requestedTargets = process.argv.slice(3);

if (!scriptName) {
  console.error("Usage: node scripts/workspaces.ts <script> [workspace...]");
  process.exit(1);
}

const workspaceRoots = requestedTargets.length > 0 ? ["apps", "packages"] : ["packages"];
const packages = new Map();
for (const root of workspaceRoots) {
  const rootDir = join(process.cwd(), root);
  if (!existsSync(rootDir)) continue;
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = join(rootDir, entry.name, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    packages.set(pkg.name, pkg);
  }
}

const targetNames =
  requestedTargets.length > 0
    ? requestedTargets
    : [...packages.keys()].filter((target) => packages.get(target)?.scripts?.[scriptName]);
const missingTargets = requestedTargets.filter(
  (target) => !packages.get(target)?.scripts?.[scriptName],
);
if (missingTargets.length > 0) {
  console.error(`Workspace script "${scriptName}" not found for: ${missingTargets.join(", ")}`);
  process.exit(1);
}

if (targetNames.length === 0) {
  console.log(`No packages/* with "${scriptName}" script.`);
  process.exit(0);
}

const run = (target) =>
  new Promise((resolve) => {
    const cmd = isPnpm
      ? `pnpm --filter ${target} run ${scriptName}`
      : `npm run ${scriptName} -w ${target}`;
    const child = spawn(cmd, { stdio: "inherit", shell: true });
    child.on("exit", (code) => resolve(code ?? 1));
  });

for (const t of targetNames) {
  const code = await run(t);
  if (code !== 0) process.exit(code);
}
process.exit(0);
