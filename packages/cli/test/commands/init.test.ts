import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const cliPath = path.join(packageRoot, "dist", "bin", "index.js");

describe("frakment init", () => {
  it("creates the current helpers without scaffolding the removed animation helper", () => {
    const projectRoot = mkdtempSync(path.join(os.tmpdir(), "frakment-init-"));

    try {
      mkdirSync(path.join(projectRoot, "app"), { recursive: true });
      writeFileSync(
        path.join(projectRoot, "app", "globals.css"),
        '@import "tailwindcss";\n'
      );
      writeFileSync(
        path.join(projectRoot, "package.json"),
        JSON.stringify({
          dependencies: {
            "class-variance-authority": "^0.7.1",
            clsx: "^2.1.1",
            "lucide-react": "^0.0.0",
            motion: "^14.0.0",
            "tailwind-merge": "^3.0.0",
          },
        })
      );

      execFileSync(process.execPath, [cliPath, "init"], {
        cwd: projectRoot,
        encoding: "utf8",
      });

      const libPath = path.join(projectRoot, "lib");
      expect(existsSync(path.join(libPath, "utils.ts"))).toBe(true);
      expect(existsSync(path.join(libPath, "motion.ts"))).toBe(true);
      expect(existsSync(path.join(libPath, "animation.ts"))).toBe(false);
    } finally {
      rmSync(projectRoot, { force: true, recursive: true });
    }
  });
});
