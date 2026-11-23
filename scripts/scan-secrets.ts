import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
const patterns = [
  { name: "AWS", re: /AKIA[0-9A-Z]{16}/g },
  { name: "GitHub PAT", re: /ghp_[A-Za-z0-9]{36}/g },
  { name: "GitHub fine", re: /github_pat_[A-Za-z0-9_]{82}/g },
  { name: "OpenAI", re: /sk-[A-Za-z0-9]{20,}/g },
  { name: "Anthropic", re: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: "Slack", re: /xox[baprs]-[A-Za-z0-9-]+/g },
  { name: "PrivateKey", re: /-----BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY-----/g },
];
const staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
let found = false;
for (const file of staged) {
  let content; try { content = readFileSync(file, "utf8"); } catch { continue; }
  for (const { name, re } of patterns) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(content)) !== null) {
      found = true;
      const line = content.slice(0, m.index).split("\n").length;
      console.error(`  ${name} in ${file}:${line} - ${m[0].slice(0, 20)}...`);
    }
  }
}
if (found) { console.error("\nCommit ditolak: secret terdeteksi."); process.exit(1); }
