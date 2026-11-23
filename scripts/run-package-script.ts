#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const scriptName = process.argv[2];
if (!scriptName) {
  console.error("Usage: node scripts/run-package-script.ts <script>");
  process.exit(1);
}

const userAgent = process.env.npm_config_user_agent || "";
const modulesDir = join(process.cwd(), "node_modules");
const isPnpm =
  userAgent.startsWith("pnpm/") ||
  (!userAgent &&
    existsSync(join(modulesDir, ".pnpm")) &&
    !existsSync(join(modulesDir, ".package-lock.json")));
const command = isPnpm ? `pnpm run ${scriptName}` : `npm run ${scriptName}`;
const child = spawn(command, { stdio: "inherit", shell: true });

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
