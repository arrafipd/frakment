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
  it("does not install Motion or scaffold the removed animation helper", () => {
    const projectRoot = mkdtempSync(path.join(os.tmpdir(), "frakment-init-"));

    try {
      mkdirSync(path.join(projectRoot, "app"), { recursive: true });
      const binPath = path.join(projectRoot, "bin");
      const installMarker = path.join(projectRoot, "installer-called");
      mkdirSync(binPath);
      const installerName = process.platform === "win32" ? "npm.cmd" : "npm";
      const installerPath = path.join(binPath, installerName);
      const installerScript =
        process.platform === "win32"
          ? `@echo off\r\necho called>"${installMarker}"\r\nexit /b 0\r\n`
          : `#!/bin/sh\nprintf called > ${JSON.stringify(installMarker)}\n`;
      writeFileSync(installerPath, installerScript, { mode: 0o755 });

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
            "tailwind-merge": "^3.0.0",
          },
        })
      );

      const pathKey =
        Object.keys(process.env).find((key) => key.toLowerCase() === "path") ??
        "PATH";
      execFileSync(process.execPath, [cliPath, "init"], {
        cwd: projectRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          [pathKey]: [binPath, process.env[pathKey] ?? ""].join(path.delimiter),
        },
      });

      const libPath = path.join(projectRoot, "lib");
      expect(existsSync(path.join(libPath, "utils.ts"))).toBe(true);
      expect(existsSync(path.join(libPath, "motion.ts"))).toBe(true);
      expect(existsSync(path.join(libPath, "animation.ts"))).toBe(false);
      expect(existsSync(installMarker)).toBe(false);
    } finally {
      rmSync(projectRoot, { force: true, recursive: true });
    }
  });
});
