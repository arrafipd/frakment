import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import * as p from "@clack/prompts";
import pc from "picocolors";

import { findProjectRoot } from "../utils/detect.js";

export async function list(options) {
  p.intro(`${pc.dim("frakment")} list`);

  let cwd;
  try {
    cwd = findProjectRoot(process.cwd());
  } catch (error) {
    p.outro(pc.red("error ") + error.message);
    process.exit(1);
  }

  const configPath = path.join(cwd, "components.json");
  if (!existsSync(configPath)) {
    p.outro(
      `${pc.red("error ")}components.json not found. Run \`frakment init\` first.`
    );
    process.exit(1);
  }

  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const registryUrl = (options.registry ?? config.registry).replace(/\/$/u, "");
  const s = p.spinner();
  s.start("fetching components");

  let index;
  try {
    const res = await fetch(`${registryUrl}/index.json`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    index = await res.json();
  } catch {
    s.stop(`${pc.red("✗")} failed to fetch component list`);
    process.exit(1);
  }
  s.stop(`${pc.green("✓")} found ${index.components.length} component(s)`);

  if (!index.components.length) {
    p.outro(pc.dim("no components available yet"));
    return;
  }

  const nameWidth = Math.max(...index.components.map((c) => c.name.length));
  const lines = index.components.map(
    (c) =>
      `  ${pc.cyan(c.name.padEnd(nameWidth))}  ${pc.dim(c.description ?? "")}`
  );

  p.outro(
    `${lines.join("\n")}\n\n  Add one with ${pc.cyan("frakment add <name>")}`
  );
}
