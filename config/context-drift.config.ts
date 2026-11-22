import { defineConfig } from "@basedkoala/context-drift";

export default defineConfig({
  include: ["**/*.md"],
  exclude: ["packages/cli/CHANGELOG.md"],
  rules: {
    brokenFileReferences: "error",
    environmentVariables: "warn",
    packageScripts: "error",
    dependencyVersions: "warn",
    markdownLinks: "error",
  },
  environmentFiles: ["**/.env.example", "**/.env.sample", "**/.env.template"],
  environment: {
    ignore: ["FRAKMENT_REGISTRY", "VERCEL_ENV", "npm_config_user_agent"],
    reportUnused: true,
  },
});
