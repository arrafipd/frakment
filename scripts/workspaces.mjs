#!/usr/bin/env node
import { spawn } from "node:child_process";

const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.startsWith("pnpm/");
const scriptName = process.argv[2];

if (!scriptName) {
  console.error("Usage: node scripts/workspaces.mjs <script>");
  process.exit(1);
}

const cmd = isPnpm
  ? `pnpm -r --if-present run ${scriptName}`
  : `npm run ${scriptName} --workspaces --if-present`;

const child = spawn(cmd, { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 1));
