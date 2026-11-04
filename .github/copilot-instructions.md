# GitHub Copilot instructions

Read `AGENTS.md` at the repository root first. It is the canonical source for build commands, conventions, docs rules, and commit policy.

Key commands: `npm ci`, `npm run build`, `npm run typecheck`, `npm run check`, `npm test`, `npm run registry:build`.

Brand name is `Frakment` in prose, lowercase `frakment` only for package names and commands.

All of `npm run check`, `npm run typecheck`, and `npm test` must pass before committing. Do not use `--no-verify`.
