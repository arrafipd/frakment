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

## Recent Commits

`0fc269e` biome public/r · `13b3065` registry format · `485021f` tarball fix · `c87b29b` monorepo · `c806ff6` naming · `f3d1d18` archive split

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
## Status Lint

Lint **0 errors** (cleanup selesai di `f74f909`, 541 → 0). `npm run check` = `Checked N files. No fixes applied.` (exit 0).

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

`gh api repos/hanshapd/frakment/rulesets --jq ".[] | {id, name, enforcement}"`
`gh api repos/hanshapd/frakment/rulesets/<id> --jq "{name, bypass: .bypass_actors, rules: [.rules[].type]}"`

Update: tulis body JSON + `gh api -X PUT repos/hanshapd/frakment/rulesets/<id> --input body.json`.

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

## GitHub Ruleset Setup

Branch `main` dilindungi **3 ruleset** (Settings → Rules → Rulesets). Tidak ada branch protection klasik.

| Ruleset | ID | Rules | Admin | Non-admin |
|---|---|---|---|---|
| `main-pr-bypass` | 26273226 | `pull_request` | bypass `always` | Wajib PR |
| `main-ci-bypass` | 26446591 | `required_status_checks` | bypass `always` | Wajib CI hijau |
| `main-strict` | 26471084 | `non_fast_forward`, `deletion` | bypass `always` | Diblok |

### Admin — full bypass

- Direct push ke `main` ✅
- Force-push `main` ✅
- Delete `main` ✅
- Merge PR saat CI merah ✅
- **Tidak perlu toggle ruleset** untuk cleanup — cukup `git push --force`

### Non-admin — terlindungi penuh

- Direct push ❌ (Ruleset A)
- Merge PR saat CI merah ❌ (Ruleset B)
- Force-push / delete `main` ❌ (Ruleset C)

### Inspeksi

`gh api repos/hanshapd/frakment/rulesets --jq ".[] | {id, name, enforcement}"`
`gh api repos/hanshapd/frakment/rulesets/<id> --jq "{name, bypass: .bypass_actors, rules: [.rules[].type]}"`

Update: tulis body JSON + `gh api -X PUT repos/hanshapd/frakment/rulesets/<id> --input body.json`.

## React Engine (@frakment/react/message-scroller)

Selesai di `2075e37`. Menggantikan `@shadcn/react` — sudah dihapus dari deps.

### Files

- `packages/react/src/message-scroller/` — 10 file: `context.tsx`, `provider.tsx`, `root.tsx`, `viewport.tsx`, `content.tsx`, `item.tsx`, `button.tsx`, `hooks.ts`, `use-merged-ref.ts`, `types.ts`, `index.ts`
- Export: `MessageScroller` (Provider/Root/Viewport/Content/Item/Button) + 3 hook (`useMessageScroller`, `useMessageScrollerScrollable`, `useMessageScrollerVisibility`)

### API surface (contract-first, matching @shadcn/react)

- 13 tipe publik di `types.ts`
- `useMessageScroller()`: `scrollToEnd`, `scrollToStart`, `scrollToMessage`
- `useMessageScrollerScrollable()`: `{ start, end }`
- `useMessageScrollerVisibility()`: `{ currentAnchorId, visibleMessageIds }`

### Migrasi

- `components/ui/message-scroller.tsx:8` — import diganti ke `@frakment/react/message-scroller`
- `registry/message-scroller.tsx:8` — sama
- Root `package.json`: `@shadcn/react` dihapus, `@frakment/react: 0.0.1` ditambah

### Catatan build lokal Windows

Turbopack crash (`0xC0000409` stack overrun) dengan multi-worker. Fix: `cross-env NEXT_WORKER_THREADS=1 next build` di `package.json` scripts. Tidak affect CI Linux.

## Backlog Publish

Semua paket siap publish (build + test hijau, tarball verified):

| Paket | Versi | Ready |
|---|---|---|
| `frakment` | 0.0.1 | ✅ |
| `@frakment/ai` | 0.0.1 | ✅ |
| `@frakment/mcp` | 0.0.1 | ✅ |
| `@frakment/react` | 0.0.1 | ✅ (engine selesai di `2075e37`) |

Langkah: `npm login` → `npm run changeset` (4 paket, `minor`) → `npm run version:packages` → commit → `npm run release`.

## Dependabot / Audit

Status: **1 alert tersisa (low), tidak ada fix**.

### esbuild (fixed)

CVE: path traversal di dev server Windows. Sebelumnya `tsup` punya nested `esbuild@0.27.7` (vulnerable). Fix via `overrides.esbuild = "^0.28.1"` di root `package.json` + clean install (`npm install` dengan npm 11, karena npm 10.9 crash `edgesOut` tanpa lockfile).

Sekarang semua `esbuild@0.28.2` (hoisted), tidak ada nested. `npm audit` bersih dari esbuild.

### deepmerge (FIXED via fork override)

CVE: prototype poisoning di `mergeObject()`. `deepmerge@4.3.1` tidak akan di-patch (maintainer menolak). Fix: override ke fork `@stackline/deepmerge@1.1.0` (drop-in replacement, CVE fixed, zero deps).

Override di `package.json`: `"deepmerge": "npm:@stackline/deepmerge@^1.1.0"`.

Diverifikasi: `npm audit` = 0 vulnerabilities, `ultracite` tetap jalan, build+test 39/39.

### Aturan ke depan

- Selama `package-lock.json` ada, **selalu `npm ci`** — bukan `npm install`. `npm ci` <60 detik kalau cache hangat.
- `npm install` hanya kalau mengubah dependency.
- Jangan `npm audit fix --force` tanpa review — sering downgrade major.

## Catatan dependency

Setelah package.json overrides berubah, jalankan 
pm install (bukan 
pm ci) sekali untuk regenerate lockfile. Setelah itu kembali ke 
pm ci untuk install cepat.

## Internal: BOM handling (CLI)

`packages/cli/src/commands/init.js` strips UTF-8 BOM from `globals.css`, `package.json`, and `components.json` before parsing. Handle file yang ditulis PowerShell 5.1 `Set-Content -Encoding utf8` (yang prepend BOM).

**Bukan docs user-facing.** Jika ada laporan "CLI error di Windows", cek BOM dulu.

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

### When adding or changing a registry component

1. Update `registry/<name>.tsx` and `components/ui/<name>.tsx` (SHA256 identical).
2. Update `content/docs/<section>/<name>.mdx` using the docs template.
3. If the change is user-facing in a package, add a changelog entry.
4. If the component is `registry:lib` and ships internal files, verify `public/r/<name>.json` lists them with the correct `targetDir`.
5. Run `npm run registry:build`, `npm run fix`, `npm run check`, `npm run typecheck`, `npm test`, `npm run build`.
6. Commit + push (admin bypass, or PR for non-admin).

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

## Security Posture: Accepted Trade-offs

Security scanning alerts from Scorecard that are **accepted by design**, not fixed. Do not dismiss without changing this note.

| Check | Count | Reason |
|---|---|---|
| `TokenPermissions` | 7 | `security-events: write` is required to upload SARIF. Cannot be removed without breaking code scanning. |
| `Fuzzing` | 1 | No fuzzing harness. Add ClusterFuzzLite if fuzzing becomes a requirement. |
| `CIIBestPractices` | 1 | Requires manual registration at bestpractices.dev (external, optional). |
| `Maintained` | 1 | Auto-resolves when repo is >90 days old. |
| `CodeReview` | 1 | Solo dev. Admin bypass is intentional (see Ruleset Setup section). |
| `BranchProtection` | 1 | Admin bypass by design. Non-admin path is fully protected. |

### Auto-resolving

- `CITests` — resolves after the first PR is merged (Scorecard scans merged PRs for CI coverage).

### Fixed (was alerting)

- zizmor/unpinned-uses (19) — pinned all `uses:` to full SHA.
- zizmor/artipacked (10) — added `persist-credentials: false` to every `actions/checkout`.
- zizmor/self-repository (5) — `./.github/actions/setup` → `$/.github/actions/setup`.
- zizmor/unpinned-images (1) — semgrep image pinned to `semgrep/semgrep:1.99.0@sha256:...`.


### Dismissed (false positive)

- `PinnedDependenciesID` (6 alerts) — dismissed. `$/.github/actions/setup` is a **local composite action** shipped in this repo. Scorecard flags any `uses:` without `@SHA` as unpinned, but local actions cannot be pinned (no remote tag). This is a Scorecard limitation, not a real issue. Dismissed with reason `won't fix` + comment. Traceable to alerts #73, #87, #88, #89, #90, #91.
