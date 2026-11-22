import { cpSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const packageRoot = process.cwd();
const distDirectory = path.join(packageRoot, "dist");

mkdirSync(distDirectory, { recursive: true });
copyFileSync(
  path.join(packageRoot, "package.json"),
  path.join(distDirectory, "package.json")
);

const templatesDirectory = path.join(packageRoot, "templates");
if (existsSync(templatesDirectory)) {
  cpSync(templatesDirectory, path.join(distDirectory, "templates"), {
    recursive: true,
  });
}
