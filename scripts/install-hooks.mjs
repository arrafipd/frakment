// Install lefthook git hooks only when running inside a git repo.
// Vercel (and some CI environments) copy source files without .git,
// so `lefthook install` fails with exit 128 and breaks `npm install`.
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

if (!existsSync(".git")) {
  process.exit(0);
}

const isWin = process.platform === "win32";
const localBin = join("node_modules", ".bin", isWin ? "lefthook.cmd" : "lefthook");
const cmd = existsSync(localBin) ? `"${localBin}" install` : "npx lefthook install";

try {
  execSync(cmd, { stdio: "inherit" });
} catch {
  // Non-fatal: missing hooks should never block install or build.
  process.exit(0);
}