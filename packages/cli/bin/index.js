#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import pc from "picocolors";

import { add } from "../src/commands/add.js";
import { init } from "../src/commands/init.js";
import { list } from "../src/commands/list.js";

const __dirname = import.meta.dirname;
const pkg = JSON.parse(
  readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
);

const program = new Command();

program
  .name("frakment")
  .description("Monochrome design system and component registry")
  .version(pkg.version)
  .addHelpText(
    "after",
    `
Examples:
  ${pc.dim("$ frakment init")}
  ${pc.dim("$ frakment add status-chip")}
  ${pc.dim("$ frakment list")}
`
  );

program
  .command("init")
  .description("Initialize frakment in your project")
  .action(init);

program
  .command("add <component>")
  .description("Add a component from the frakment registry")
  .option("--registry <url>", "Custom registry URL")
  .option("--overwrite", "Overwrite existing files", false)
  .action(add);

program
  .command("list")
  .description("List available components")
  .option("--registry <url>", "Custom registry URL")
  .action(list);

program.parse();
