# Frakment — HANDOFF

> Detail: `HANDOFF.archive/README.md`.

## Current State

`main` = `origin/main` @ `0fc269e` (clean). Monorepo aktif (5 paket). Build 174 pages EXIT=0, typecheck EXIT=0, test 39/39, registry 29 components. Shadcn deps: `@shadcn/react` (runtime), `@shadcn/helpers` (dev).

| # | Nama | Path | Publish |
|---|---|---|---|
| 1 | `frakment` | `packages/cli` | pending |
| 2 | `@frakment/ai` | `packages/ai` | pending |
| 3 | `@frakment/react` | `packages/react` | pending |
| 4 | `@frakment/mcp` | `packages/mcp` | pending |
| 5 | `@frakment/site` | root | private |

## Backlog

1. **Publish npm** — `npm run changeset` -> `version:packages` -> `release`. Skip `@frakment/react`.
2. **Engine `@frakment/react`** — placeholder `export {};`, ganti `@shadcn/react`.
4. **`public/r/` osilasi** — `registry:build` vs `ultracite fix` format beda. Fix sementara biome ignore (`0fc269e`).
5. **Dependabot low** — `security/dependabot/3`.
6. **Branch protection** — push bypass sekarang, ke depan PR.

## Gotchas — New

- **#26** TS7 native tidak emit `.d.ts` -> TS 5.7.3 di paket.
- **#27** `tsconfig.tsbuildinfo` stale -> hapus / `--incremental false`.
- **#28** `ignoreDeprecations`: TS5.7.3 hanya `"5.0"`.
- **#29** `tsup dts:true` gagal TS7 -> `dts:false` + `tsc --emitDeclarationOnly`.
- **#30** biome `extends: ["ultracite/biome/core"]`, ignore `!**/node_modules`.
- **#31** PS 5.1 tidak dukung `utf8NoBOM` -> `[IO.File]::WriteAllText` + `UTF8Encoding($false)`.
- **#32** heredoc >2KB cut saat paste -> pecah chunk atau base64.

Gotchas lama (#1-25): `HANDOFF.archive/gotchas.md`.

- #34: components live at `components/ui/<name>.tsx`, not `components/<name>.tsx`. Wrong path silently passes typecheck (nothing imports it). Verify with `Test-Path` before writing.
- #35: `lib/icons.ts` shim mixed naming: `Globe` exists, `GlobeIcon` does not; `X` and `XIcon` both exist. Verify with `Select-String -Path lib/icons.ts -Pattern 'Globe'` before using in demos.
- #36: Next.js build skips TS type validation. Run `npm run typecheck` explicitly; `npm run build` alone will not catch type errors.
- #37: crossfade text = stacked grid (`col-start-1 row-start-1`) + CSS opacity. Do NOT use `AnimatePresence mode="popLayout"` — layout shifts because exiting element becomes `position: absolute`.
- #38: numeric roll/count = `@number-flow/react` bare. No wrapper, no `motion.span`, no custom timing props; wrapping disables its animation.
- #39: theme.css = cli/templates/theme.css (SHA256); @keyframes must be in theme.css not globals.css.
- #40: preview must equal user-facing output. `components/ui/*` and `examples/*` import `lucide-react`; only site chrome (`site-header`, `command-menu`, nav) uses `@/lib/icons` Phosphor shim. `lib/icons.ts` is internal-only; `icons` entry removed from registry.
- #41: Duplicate import in MDX breaks OG image build; error shows /og/docs/... not the file. Dedupe imports before commit.
- #42: Motion `animate={{ height: "auto" }}` does not re-target when content grows. Use ResizeObserver + numeric height.
- #43: `data-[state=closed]:hidden` on wrapper kills AnimatePresence exit. Use MutationObserver on data-state instead.
- #44: `className` with padding on motion.div leaks out during height:0; overflow:hidden clips content not padding. Move className to inner div.
- #45: Preview must equal shipped. Large demos need a `-demo` registry block that pulls every dependency, not just the primitive.

## Pointers

- Archive: [`HANDOFF.archive/README.md`](./HANDOFF.archive/README.md)
- Migration: [`session-monorepo-migration.md`](./HANDOFF.archive/session-monorepo-migration.md)
- Workflow: [`patterns.md`](./HANDOFF.archive/patterns.md)
- Decisions: [`plan-monorepo.md`](./HANDOFF.archive/plan-monorepo.md)

## Maintenance

- Commit + HANDOFF update per phase.
- Gotcha baru -> 1 baris di atas + detail di `gotchas.md`.
- HANDOFF <= 15KB. Lewat -> extract ke archive.
- Perubahan user-facing -> changelog `content/docs/changelog/YYYY-MM-DD.mdx`.
## Efek per aktor

**Admin (solo dev):**
- Direct push ke `main` → bisa (bypass Ruleset B)
- Force-push / delete `main` → bisa (bypass Ruleset C)
- Merge PR saat CI merah → bisa (bypass Ruleset B)
- Tidak perlu toggle ruleset untuk cleanup — cukup `git push --force`

**Non-admin (future contributors):**
- Direct push → diblok (Ruleset A)
- Merge PR saat CI merah → diblok (Ruleset B)
- Force-push / delete `main` → diblok (Ruleset C)
- Wajib lewat PR + CI hijau

### Konsekuensi

- Admin bisa merusak `main` (force-push, delete). Recovery: `git reset --hard <sha>` + force-push.
- History `main` bisa terpolusi kalau admin push commit test. Cleanup: force-push ke commit bersih.
- Disiplin lokal tetap penting: lefthook pre-push jalankan build+test.

### Perintah inspeksi

`gh api repos/arrafipd/frakment/rulesets --jq ".[] | {id, name, enforcement}"`
`gh api repos/arrafipd/frakment/rulesets/<id> --jq "{name, bypass: .bypass_actors, rules: [.rules[].type]}"`

Update: tulis body JSON + `gh api -X PUT repos/arrafipd/frakment/rulesets/<id> --input body.json`.

## Commit/PR Policy

### Admin (solo dev)

**Commit + push langsung ke `main`. Tanpa PR.**

Alur:
1. `npm run fix && npm run check && npm run typecheck && npm test` (verify lokal)
2. `git add -A && git commit -m "..."` — pre-commit hook jalankan format+lint+typecheck otomatis
3. `git push origin main` — pre-push hook jalankan build+test otomatis

Admin bypass semua ruleset. Kalau ada kesalahan yang perlu dibersihkan: `git reset --hard <sha>` + `git push --force`.

### Non-admin (future contributors)

Wajib PR + CI hijau. Direct push diblok. Lihat section Ruleset di bawah.

## Parked: message-scroller engine (SKIPPED 2026-11-04)

**Status:** skipped by user. Re-ask in a future session if idle — do not start unilaterally.

### Problem

`registry/message-scroller.tsx` imports from `@frakment/react/message-scroller` (npm package, not published yet). `public/r/message-scroller.json` therefore has `@frakment/react` in `dependencies`, and any user running `npx frakment add message-scroller` fails at `npm install` — the package does not exist on npm.

`@shadcn/react` is also still listed in `frakment.json` deps for `message-scroller` (stale, must be removed regardless).

### Options (user did not choose yet)

1. **Ship engine as `registry:lib`** — same pattern as `ai`. Create entry `message-scroller-engine` in `frakment.json` with `sourceDir: packages/react/src/message-scroller`, `targetDir: lib/message-scroller`. Change `registry/message-scroller.tsx` import to `@/lib/message-scroller`. User installs → source lands in `lib/message-scroller/`, no npm dep needed. **No publish required.**
2. **Publish `@frakment/react` to npm first** — then `npm install` succeeds. Requires completing publish workflow (changeset, version, release).
3. **Remove `message-scroller` + `message-animated` from registry** until either above is done. Docs then only show components that actually work.
4. **Leave as-is** — docs must say "requires `@frakment/react`" which violates the docs-accuracy rule.

Recommendation was option 1 (consistent with `ai`, self-contained registry). User skipped.

### What was already done

- `ai` is now a proper registry item (`registry:lib`, 10 files, `sourceDir: packages/ai/src`, `targetDir: lib/ai`) — shipped with `message-animated` automatically. This part works.
- `scripts/build-registry.mjs` patched: `@/lib/ai` → registry dep `ai` (before generic `@/` skip).
- End-to-end install tested in `%TEMP%\frakment-install-test` with local HTTP server on `:8765`: `message-animated` fetch + write succeeded (10 files in `lib/ai/`, `lib/icons.ts`, `bubble`, `message-scroller`, `button`). Only `npm install` step failed on `@frakment/react`.

### When resuming

1. Ask user which option (1–4).
2. If option 1: create `message-scroller-engine` entry, swap import, rebuild, retest install, then update `docs/libraries/react.mdx` (create it only if engine is now shipped).
3. If option 2: finish publish workflow first, then retest.
4. Either way: remove `@shadcn/react` from `frakment.json` message-scroller deps — it is stale.

## Docs & Changelog Rules (AI-facing)

**HANDOFF is admin/AI only. Never mention it in `CONTRIBUTING.md`, `README.md`, user docs, changelog, commit messages, or code comments.** No contributor should ever know this file exists.

User-facing guidelines live in `CONTRIBUTING.md`. The rules below are the AI-side mirror so docs stay consistent when written by an agent.

### Docs rules (same as CONTRIBUTING)

- **Shipped state only.** Docs describe what exists and works in `main` today. No roadmap, milestones, "planned", "in development", "coming soon", "TBD", "WIP", or "draft".
- **No internal detail.** Never mention build tooling, dev paths, temporary files, local HTTP servers, `_old`, `node_modules`, or scratch notes in docs.
- **English only.** No mixed-language prose.
- **One sentence per paragraph.** Rich but simple.
- **Component page shape:** frontmatter + 2–3 sentence intro + `## Installation` (`<Steps>`) + `## Usage` (`<ComponentPreview>`) + `## API`. Reference: `content/docs/components/button.mdx`.

### Changelog rules (same as CONTRIBUTING)

- **Only for library/package changes:** new registry component, visual/behaviour change, public API change, CLI command/flag change, `theme.css` token change, registry schema change, package publish/rename.
- **Skip:** site-only UI (header, sidebar, demo page), docs typo, refactor internal, dev tooling, CI changes.
- **One file per day:** `content/docs/changelog/YYYY-MM-DD.mdx`. Immutable after merge.
- **Preview-first pattern:** for visual changes, `<ComponentPreview>` goes **above** the prose. Non-visual sections (CLI, config, dependency) use a fenced code diff only.
- **Template reference:** `content/docs/changelog/2026-11-03.mdx`.

### When adding a new registry component

Eight steps. Skipping steps 4 or 5 causes a silent navigation failure: the component becomes installable via `npx frakment add` but does not appear in the sidebar, mobile nav, or command menu.

1. Copy `components/ui/<name>.tsx` to `registry/<name>.tsx` (SHA256 identical).
2. Add an entry to `frakment.json` with `name`, `version`, `title`, `description`, `source`, `target`, `dependencies`, `registryDependencies`.
3. Add `content/docs/components/<name>.mdx` using the docs template (reference: `button.mdx`).
4. Add `"<name>"` to `content/docs/components/meta.json` pages array, alphabetically. Without this the page does not appear in sidebar or command menu.
5. Add `"/docs/components/<name>"` to `PAGES_NEW` in `lib/docs.ts`. Without this the new badge is missing. See PAGES_NEW semantics below.
6. Add `content/docs/changelog/YYYY-MM-DD.mdx` (preview-first, template `2026-11-03.mdx`).
7. If `registry:lib` and ships internal files, verify `public/r/<name>.json` lists them with the correct `targetDir`.
8. Run `npm run registry:build`, `npm run fix`, `npm run check`, `npm run typecheck`, `npm test`, `npm run build`. Commit and push.

### PAGES_NEW semantics

`PAGES_NEW` in `lib/docs.ts` controls the blue new badge in sidebar and mobile nav.

It is a rotating set of the latest release batch, not a cumulative list. When a new batch ships, replace the entire set with only the components from that batch. Entries from the previous batch graduate and their badges disappear.

Example: yesterday batch was `{card, tooltip, toggle}`. Today batch is `{accordion}`. Today `PAGES_NEW = {"/docs/components/accordion"}`. Card, tooltip, and toggle lose their badge.

Exception: a component whose docs page shipped in an earlier batch but whose registry entry only became installable today (e.g. `card` on 2026-11-05) does not get re-added. `PAGES_NEW` tracks page release, not registry availability.

### Silent navigation failures

Three updates are easy to forget and fail silently. The component installs via CLI and compiles, but does not appear in navigation:

- Missing `frakment.json` entry: `npx frakment add <name>` returns 404.
- Missing `content/docs/components/meta.json` entry: page exists at its URL but is not linked from sidebar, mobile nav, or command menu.
- Missing `lib/docs.ts` `PAGES_NEW` entry: page appears everywhere but without the new badge.

Always verify all three after adding a component.

### When only changing site UI (header, sidebar, demo page)

- No changelog. No docs update unless the component page itself changed.
- Still run `npm run check` + `npm run typecheck` before commit.

### When publishing a package to npm

1. Update the corresponding docs page: replace "copy source" instructions with `npm install <pkg>`.
2. Add a changelog entry with a `### Published: <pkg>` section and an install snippet.
3. If a component no longer needs a `registry:lib` twin (because the npm package now covers it), decide explicitly: keep both paths or drop the registry twin. Document the decision in this file.
4. Update `libraries/index.mdx` table — remove "not published" caveats.

### Never

- Never mention `HANDOFF.md` in any user-facing file (docs, README, CONTRIBUTING, changelog, commit messages, code comments).
- Never write roadmap, milestone, or forward-looking content in docs or changelog.
- Never write BOM, PowerShell, `_old`, `node_modules`, tooling workarounds, or local-server notes in docs. Those belong here, in HANDOFF, only.
- Never document a component that is not shipped and working. If it is parked, note it in the "Parked" section here, not in docs.

## MCP compose + list_scenarios

Moved to archive on 2026-11-06. See `HANDOFF.archive/security.md`.


## Archived sections

See archive.

Topics: see archive.

See Efek per aktor, #31.
