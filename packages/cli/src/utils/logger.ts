import chalk from "chalk";
import ora from "ora";

export const logger = {
  break: () => console.log(""),
  error: (...args: unknown[]) =>
    console.log(chalk.red(...args.map((value) => String(value)))),
  info: (...args: unknown[]) =>
    console.log(chalk.cyan(...args.map((value) => String(value)))),
  log: (...args: unknown[]) => console.log(...args),
  spinner: (text: string) => ora(text),
  success: (...args: unknown[]) =>
    console.log(chalk.green(...args.map((value) => String(value)))),
  warn: (...args: unknown[]) =>
    console.log(chalk.yellow(...args.map((value) => String(value)))),
};
