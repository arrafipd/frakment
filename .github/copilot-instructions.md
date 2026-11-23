# GitHub Copilot instructions

Read `AGENTS.md` at the repository root first. It is the canonical source for build commands, conventions, docs rules, and commit policy.

Use `npm ci` or `pnpm install --frozen-lockfile`. Run scripts with `npm run <script>` or `pnpm <script>`, including `build`, `typecheck`, `check`, `test`, and `registry:build`.

Brand name is `Frakment` in prose, lowercase `frakment` only for package names and commands.

All of `check`, `typecheck`, and `test` must pass before committing with the selected package manager. Do not use `--no-verify`.
