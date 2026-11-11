#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";

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
  ${chalk.dim("$ frakment init")}
  ${chalk.dim("$ frakment add button")}
  ${chalk.dim("$ frakment add button bubble")}
  ${chalk.dim("$ frakment list")}
`
  );

program
  .command("init")
  .description("Initialize frakment in your project")
  .action(init);

program
  .command("add <components...>")
  .description("Add one or more components from the frakment registry")
  .option(
    "--dry-run",
    "Show planned file and dependency changes without writing"
  )
  .option("--registry <url>", "Custom registry URL")
  .option("--skip-dependencies", "Do not install missing npm dependencies")
  .option("--overwrite", "Overwrite existing files", false)
  .action(add);

program
  .command("list")
  .description("List available components")
  .option("--registry <url>", "Custom registry URL")
  .action(list);

program.parse();
