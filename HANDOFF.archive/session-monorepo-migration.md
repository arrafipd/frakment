# Session: Monorepo Migration + npm Tarball Fix

[↑ Back to HANDOFF](../HANDOFF.md) · [Archive TOC](./README.md)

**Status:** ✅ COMPLETED
**Commits:** `c87b29b` (migration) → `485021f` (tarball fix) → `13b3065` (registry format) → `0fc269e` (public/r exclude)

## Apa yang dikerjakan

Konversi repo tunggal → **npm workspaces monorepo** dengan 5 paket:

| # | Nama npm | Type | Publish | Path |
|---|---|---|---|---|
| 1 | `frakment` | CLI | ✅ (pending) | `packages/cli` |
| 2 | `@frakment/ai` | AI engine | ✅ (pending) | `packages/ai` |
| 3 | `@frakment/react` | React engine (placeholder) | ✅ (pending) | `packages/react` |
| 4 | `@frakment/mcp` | MCP server (bin `frakment-mcp`) | ✅ (pending) | `packages/mcp` |
| 5 | `@frakment/site` | Site Next.js | ❌ private | root |

## Phase 1 — Root `package.json` + `.changeset/`

- Root renamed → `@frakment/site`, `private: true`, `workspaces: ["packages/*"]`.
- Scripts baru: `changeset`, `version:packages`, `release`, `predev`/`prebuild`/`precheck`/`pretest`/`pretypecheck` (semua jalankan `build --workspaces --if-present`).
- `@changesets/cli` devDep, `.changeset/config.json` (`ignore: ["@frakment/site"]`), `.changeset/README.md`.

## Phase 2 — Pindah `cli`, `mcp`, `lib/ai`

- `cli/` → `packages/cli/`
- `mcp/` → `packages/mcp/` (rename ke `@frakment/mcp`, `license: "SEE LICENSE IN LICENSE"`, `repository.directory: "packages/mcp"`, **bin `frakment-mcp` tidak berubah**)
- `lib/ai/*.ts` (10 file) → `packages/ai/src/*.ts`
- `lib/ai.ts` menjadi shim: `export { createChat, getMessageText } from "@frakment/ai"` + `export type { UIMessage }`. 5 importers (`components/message-animated.tsx`, `examples/*`, `registry/message-animated.tsx`) **tidak disentuh**.

## Phase 3 — Skeleton `@frakment/react`

- `packages/react/{package.json, tsconfig.json, tsup.config.ts, src/index.ts, README.md}`.
- `src/index.ts` = placeholder `export {};` — engine message-scroller menyusul di sesi terpisah.

## Phase 4 — Cleanup + verify

- `next.config.mjs`: `transpilePackages: ["@frakment/ai", "@frakment/react"]`.
- `.gitignore`: tambah `packages/*/dist`, `packages/*/.turbo`, `*.tsbuildinfo`.
- Hapus `packages/cli/node_modules`, `packages/mcp/node_modules`, dan `package-lock.json` sub-paket.

## Phase 5 — MCP reference replace

- Replace `npx -y frakment-mcp` → `npx -y @frakment/mcp` di 8 file: `README.md`, `content/docs/mcp/index.mdx`, `skills/frakment-usage/SKILL.md`, `components/agents-popover.tsx`, `components/home-ctas.tsx`, `constants/site.ts`, `lib/agent-discovery/site-agent-skill.ts`, `packages/mcp/README.md`.
- Bin name `frakment-mcp` **tidak** diubah.

## Verifikasi final

- Build `EXIT=0` (**174 pages**, naik dari 159)
- Typecheck `EXIT=0`
- Test **39/39**
- CLI `node packages/cli/bin/index.js --version` → cetak versi
- MCP `node --check packages/mcp/index.js` → syntax OK
- Tarball dry-run: LICENSE ✅, no `.bak`, `dist/` benar
- Install test dari `%TEMP%` kosong: import `@frakment/ai` works, `frakment-mcp` bin resolve

## Tarball fix (commit `485021f`)

- LICENSE copy ke `packages/{ai,mcp,react}/LICENSE`
- `license` field: `"SEE LICENSE IN ../../LICENSE"` → `"SEE LICENSE IN LICENSE"`
- Hapus `packages/cli/templates/theme.css.bak` (source-controlled backup yang masuk `files` whitelist, tidak bisa di-exclude via `.npmignore`)

## Registry osilasi (commit `13b3065` + `0fc269e`)

- `registry:build` output JSON format (array multi-line) berbeda dari `ultracite fix` (array collapse). Setiap kali build jalan → `public/r/*.json` berubah.
- Fix sementara: `biome.json` `files.includes` exclude `!**/public/r`.
- **Long-term:** pilih satu format output, atau pindah `registry:build` ke pre-commit hook.

## Gotcha baru (lihat HANDOFF Active)

- #26 — TS7 native tidak emit `.d.ts`
- #27 — `tsconfig.tsbuildinfo` cache
- #28 — `ignoreDeprecations` version mismatch
- #29 — `tsup dts:true` gagal di TS7
- #30 — `biome.json` extend + ignore pattern