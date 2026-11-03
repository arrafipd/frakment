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
