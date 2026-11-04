# AGENTS.md

Frakment is a component registry for React interfaces. Components are standalone and copy-paste, shipped from a flat-file registry at `public/r/*.json`. The repo is an npm workspaces monorepo: the Next.js site is at the root (`@frakment/site`), packages live in `packages/*`.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS v4
- Fumadocs for docs, Biome via Ultracite for lint and format
- npm workspaces, TypeScript 5.7.3 for package declaration builds
- Vitest for tests

## Commands

| Task | Command |
| --- | --- |
| Install (locked) | `npm ci` |
| Dev server | `npm run dev` |
| Build site | `npm run build` |
| Typecheck | `npm run typecheck` |
| Lint + format check | `npm run check` |
| Auto-fix lint and format | `npm run fix` |
| Tests | `npm test` |
| Rebuild registry JSON | `npm run registry:build` |
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
- Component pages follow: frontmatter, short intro, `## Installation` with `<Steps>`, `## Usage` with `<ComponentPreview>`, `## API`. Reference: `content/docs/components/button.mdx`.

### Changelog

Changelog files live at `content/docs/changelog/YYYY-MM-DD.mdx` and are immutable after merge. Only add an entry for user-facing library or package changes: new registry component, visual or behaviour change, public API change, CLI change, theme token change, registry schema change, package publish or rename. Skip site-only UI, docs typos, and internal tooling.

Preview first: for visual changes, `<ComponentPreview>` goes above the prose.

### Registry

`registry/*.tsx` is the source of truth. `components/ui/*.tsx` must be byte-identical. After editing either, run `npm run registry:build`. If a component imports `@/lib/icons`, its `registryDependencies` must include `icons`.

### Commit policy

All of `npm run check`, `npm run typecheck`, and `npm test` must pass before committing. Do not use `--no-verify`. Commit messages use conventional prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.

## Editing hazard

Do not edit files under `content/docs/` with PowerShell 5.1 string replacement. Its encoding handling corrupts MDX: em-dashes break and letters get replaced. Use an editor or a Node.js script with `fs.readFileSync` / `writeFileSync` and `utf8`.

## Agent resources

- Skill: `skills/frakment-usage/SKILL.md` for discovering, fetching, and installing components
- Registry index: `https://frakment.vercel.app/r/index.json`
- MCP server: `npx -y @frakment/mcp` with tools `list_components`, `view_component`, `search_components`, `get_install_command`
- Full agent docs: `https://frakment.vercel.app/llms.txt`

## Never

- Never mention internal notes, scratch files, or admin-only documents in user-facing files.
- Never document a component that is not shipped.
- Never skip the pre-commit checks.
