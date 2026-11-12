#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.startsWith("pnpm/");
const pkgPath = "package.json";

if (!isPnpm) {
  execSync("npm i --no-save ffmpeg-static && npm rebuild ffmpeg-static", {
    stdio: "inherit",
  });
  process.exit(0);
}

// pnpm has no --no-save. Add as dev dep, rebuild, then restore package.json.
const origPkg = readFileSync(pkgPath, "utf8");
try {
  execSync("pnpm add -D ffmpeg-static", { stdio: "inherit" });
  execSync("pnpm rebuild ffmpeg-static", { stdio: "inherit" });
} finally {
  writeFileSync(pkgPath, origPkg, "utf8");
  console.log("");
  console.log("ffmpeg-static installed in node_modules.");
  console.log("package.json restored (no devDependency added).");
  console.log("pnpm-lock.yaml may reference ffmpeg-static; it is gitignored.");
  console.log('Run "pnpm install" later to prune once assets are generated.');
}
