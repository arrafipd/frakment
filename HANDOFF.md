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
## Commit/PR Policy (WAJIB)

**Semua harus hijau sebelum commit dan push. TIDAK ADA `--no-verify`.**

| Check | Command | Wajib |
|---|---|---|
| Format | `npm run fix` (idempotent) | ✅ |
| Lint | `npm run check` | ✅ |
| Typecheck | `npm run typecheck` | ✅ |
| Build site | `npm run build` | ✅ (pre-push) |
| Test | `npm test` | ✅ (pre-push) |
| Build workspaces | `npm run build --workspaces --if-present` | ✅ (otomatis pre*) |

Lefthook pre-commit jalankan format+lint+typecheck; pre-push jalankan build+test. **Kalau gagal, fix — jangan bypass.**

Hotfix darurat: branch terpisah + PR, jangan push langsung ke `main`.

Enforcement server-side: **branch protection** di GitHub → require status checks + require PR. Setup: Settings → Branches → main.

## Status Lint

Lint **0 errors** (cleanup selesai di `f74f909`, 541 → 0). `npm run check` = `Checked N files. No fixes applied.` (exit 0).

## GitHub Ruleset Setup

Branch `main` dilindungi **3 ruleset terpisah** (Settings → Rules → Rulesets). Tidak ada branch protection klasik.

| Ruleset | ID | Rules | Admin bypass | Non-admin |
|---|---|---|---|---|
| `main-pr-bypass` | 26273226 | `pull_request` | `always` | Wajib PR |
| `main-ci-bypass` | 26446591 | `required_status_checks` | `always` | Wajib CI hijau |
| `main-strict` | 26471084 | `non_fast_forward`, `deletion` | `always` | Diblok |

### Efek per aktor

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

