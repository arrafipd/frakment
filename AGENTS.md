# AGENTS.md

Frakment is a component registry for React interfaces. The Next.js site is in `apps/web`, the Expo registry is in `apps/native`, and shared packages are in `packages/*`. Web and native components are shipped through their respective flat-file registries.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS v4
- Fumadocs for docs, Biome via Ultracite for lint and format
- npm workspaces, TypeScript `^5.9.3` for package declaration builds
- Vitest for tests

## Commands

| Task                     | Command                   |
| ------------------------ | ------------------------- |
| Install (locked)         | `npm ci`                  |
| Dev server               | `npm run dev`             |
| Build site               | `npm run build`           |
| Typecheck                | `npm run typecheck`       |
| Lint + format check      | `npm run check`           |
| Auto-fix lint and format | `npm run fix`             |
| Tests                    | `npm test`                |
| Rebuild registry JSON    | `npm run registry:build`  |
| Regenerate README images | `npm run assets:generate` |

Use `npm install` only when changing dependencies. Otherwise `npm ci`.

## Conventions

### Brand name

`Frakment` (capital F) in prose, headings, comments, and docs. Lowercase `frakment` only for package names, commands, file names, and URLs. Uppercase `FRAKMENT_*` for env vars and CSS markers.

Never write `FraKment`, `FRAKment`, or `frakmenT`.

### Docs

- Describe only what ships and works today. No roadmap, milestones, planned, in development, or coming soon.
- No internal detail: no build tooling, dev paths, temp files, or local server notes.
- English only. One sentence per paragraph.
- Component pages follow: frontmatter, short intro, `## Installation` with `<Steps>`, `## Usage` with `<ComponentPreview>`, `## API`. Reference: `apps/web/content/docs/components/web/button.mdx`.

### Changelog

Changelog files live in `apps/web/content/docs/changelog/` and use the `YYYY-MM-DD.mdx` naming format. They are immutable after merge unless the project owner explicitly authorizes a historical correction. Record any such correction in a new changelog entry. Only add an entry for user-facing library or package changes: new registry component, visual or behaviour change, public API change, CLI change, theme token change, registry schema change, package publish or rename. Skip site-only UI, docs typos, and internal tooling.

Preview first: for visual changes, `<ComponentPreview>` goes above the prose.

### Registry

`apps/web/registry/*.tsx` is the source of truth for web components. `apps/web/components/ui/*.tsx` must be byte-identical. Native sources live in `apps/native/registry/*.tsx`. After editing registry sources or metadata, run `npm run registry:build`. If a component imports `@/lib/icons`, its `registryDependencies` must include `icons`.

Initialize the Skills submodule with `git submodule update --init apps/web/skills-source` before running registry builds or tests.

### Commit policy

All of `npm run check`, `npm run typecheck`, and `npm test` must pass before committing. Do not use `--no-verify`. Commit messages use conventional prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.

## Editing hazard

Do not edit files under `apps/web/content/docs/` with PowerShell 5.1 string replacement. Its encoding handling corrupts MDX: em-dashes break and letters get replaced. Use an editor or a Node.js script with `fs.readFileSync` / `writeFileSync` and `utf8`.

## Agent resources

- Skill source: `apps/web/skills-source/skills/frakment-usage/SKILL.md` in the `frakment/skills` submodule
- Registry index: `https://www.arrafi.dev/frakment/r/index.json`
- MCP server: `npx -y @frakment/mcp` with tools `list_components`, `view_component`, `search_components`, `get_install_command`, `list_scenarios`, `compose`; source and releases live in `frakment/mcp`
- Full agent docs: `https://www.arrafi.dev/frakment/llms.txt`

## Never

- Never mention internal notes, scratch files, or maintainer docs in user-facing files.
- Never document a component that is not shipped.
- Never skip the pre-commit checks.
