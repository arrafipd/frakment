import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const consumers = [
  "components/docs-sidebar.tsx",
  "components/mobile-nav.tsx",
  "components/command-menu.tsx",
];
describe("nav consistency", () => {
  it.each(consumers)("%s imports buildNavGroups", (f) => {
    expect(read(f)).toMatch(
      /import\s*\{[^}]*\bbuildNavGroups\b[^}]*\}\s*from\s*["']@\/lib\/docs["']/u
    );
  });
  it.each(consumers)("%s no local buildNavGroups", (f) => {
    expect(read(f)).not.toMatch(/(?:const|function)\s+buildNavGroups\b/u);
  });
  it("exported only from lib/docs.ts", () => {
    expect(read("lib/docs.ts")).toMatch(
      /export\s+(?:function|const)\s+buildNavGroups\b/u
    );
  });
});
