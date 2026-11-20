import { existsSync } from "node:fs";
import path from "node:path";

export function findProjectRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("No package.json found. Are you inside a project?");
}

export function detectPackageManager(cwd) {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  if (existsSync(path.join(cwd, "bun.lockb"))) {
    return "bun";
  }
  return "npm";
}

export function detectGlobalsCss(cwd) {
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
    "styles/globals.css",
    "src/styles/globals.css",
  ];
  return (
    candidates.find((p) => existsSync(path.join(cwd, p))) ?? "app/globals.css"
  );
}
