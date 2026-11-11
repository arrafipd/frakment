import { readFileSync } from "node:fs";
const firstLine = readFileSync(process.argv[2], "utf8").split(/\r?\n/)[0].trim();
const re = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\([^\)]+\))?!?: .{1,}$/;
if (!re.test(firstLine)) {
  console.error("Commit ditolak: bukan Conventional Commits.");
  console.error("Contoh: feat(button): tambah varian ghost");
  process.exit(1);
}
