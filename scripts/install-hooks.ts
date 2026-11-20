


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

  process.exit(0);
}