import chalk from "chalk";
import ora from "ora";

export const logger = {
  break: () => console.log(""),
  error: (...args) => console.log(chalk.red(...args)),
  info: (...args) => console.log(chalk.cyan(...args)),
  log: (...args) => console.log(...args),
  spinner: (text) => ora(text),
  success: (...args) => console.log(chalk.green(...args)),
  warn: (...args) => console.log(chalk.yellow(...args)),
};
