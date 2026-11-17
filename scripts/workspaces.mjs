#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.startsWith("pnpm/");
const scriptName = process.argv[2];

if (!scriptName) {
  console.error("Usage: node scripts/workspaces.mjs <script>");
  process.exit(1);
}

// Build only packages/* (dependency libraries), NOT apps/*.
// App build is invoked explicitly via root scripts ("npm run build -w @frakment/web").
const packagesDir = join(process.cwd(), "packages");
const targets = [];
for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const pkgPath = join(packagesDir, entry.name, "package.json");
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.scripts && pkg.scripts[scriptName]) targets.push(pkg.name);
}

if (targets.length === 0) {
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

for (const t of targets) {
  const code = await run(t);
  if (code !== 0) process.exit(code);
}
process.exit(0);
