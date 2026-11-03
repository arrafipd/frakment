# Frakment — HANDOFF

> **Historical log lengkap** (semua SESSION_UPDATE lama, gotcha full text, patterns detail): `HANDOFF.archive/README.md`. Grep di sana kalau butuh detail.

## Current State

- Branch `main` = `origin/main`, working tree clean.
- Build `EXIT=0` (159 pages), typecheck `EXIT=0`, test **39/39**, registry **29 components**.
- Shadcn deps remaining: `@shadcn/react` (runtime, user dapat via message-scroller), `@shadcn/helpers` (dev-only, demo).

## Archive Index

Detail per sesi + reference lengkap ada di folder `HANDOFF.archive/`. Setiap file archive punya link balik ke HANDOFF.

- [README](./HANDOFF.archive/README.md) — TOC semua archive
- [gotchas.md](./HANDOFF.archive/gotchas.md) — full detail #1–25
- [patterns.md](./HANDOFF.archive/patterns.md) — MDX rich, demo, meta.json, PowerShell
- [session-docs-enrichment](./HANDOFF.archive/session-docs-enrichment.md) — textarea/empty/input-group/field + checkbox/label/select/switch
- [session-css-fixes](./HANDOFF.archive/session-css-fixes.md) — globals.css custom-variant, site↔CLI sync, preview off-center
- [session-component-additions](./HANDOFF.archive/session-component-additions.md) — card, tooltip, dropdown, toggle, toggle-group
- [session-lucide-migration](./HANDOFF.archive/session-lucide-migration.md) — lucide → phosphor
- [session-ai-port](./HANDOFF.archive/session-ai-port.md) — first-party chat engine `lib/ai/`
- [plan-monorepo](./HANDOFF.archive/plan-monorepo.md) — monorepo conversion + npm publish plan (active)

## Active Plan — Monorepo + npm publish

Detail lengkap: [`HANDOFF.archive/plan-monorepo.md`](./HANDOFF.archive/plan-monorepo.md)

**Naming final (5 packages, 4 published):**

| #   | Nama npm          | Type                            | Publish    |
| --- | ----------------- | ------------------------------- | ---------- |
| 1   | `frakment`        | CLI (unscoped, brand command)   | ✅         |
| 2   | `@frakment/ai`    | AI engine                       | ✅         |
| 3   | `@frakment/react` | React engine                    | ✅         |
| 4   | `@frakment/mcp`   | MCP server (bin `frakment-mcp`) | ✅         |
| 5   | `@frakment/site`  | Site Next.js (root)             | ❌ private |

**5 phase (~2.5 jam):**

1. Root `package.json` — rename `frakment` → `@frakment/site`, `workspaces: ["packages/*"]`, `.changeset/` config + scripts
2. Move `cli/` → `packages/cli/` (name tetap `frakment`) + `mcp/` → `packages/mcp/` (rename `@frakment/mcp`) + `lib/ai/` → `packages/ai/src/` + shim `lib/ai.ts`
3. Skeleton `packages/react/` (`@frakment/react`, engine diisi sesi berikutnya)
4. Cleanup + `transpilePackages` + `npm install` hoist + verify build/typecheck/check/test + CLI + MCP
5. Update ~17 MCP doc refs (`frakment-mcp` → `@frakment/mcp`). CLI docs (~116 refs) **tidak diubah** — `npx frakment init` tetap valid.

**Publish besok:** `frakment`, `@frakment/ai`, `@frakment/mcp` (3 packages). `@frakment/react` publish terpisah setelah engine selesai.

**Publish cycle:** `npm run changeset` → `npm run version:packages` → `npm run release`.

## Active Plan — replace external chat helper

**Status: COMPLETE.** External helper replaced with first-party engine at `lib/ai/` (11 modules + `lib/ai.ts`). Contract-complete. Package uninstalled. Details: `HANDOFF.archive/README.md`.

**Next:** rewrite `@shadcn/react` (message-scroller engine) as `@frakment/react` — separate session, plan in archive.

## Component Registry (29)

29 components — lihat `frakment.json`.

## Docs Pages (20, di `meta.json`)

20 pages di `meta.json`.

## Shadcn Status

| Package           | Status                  | User dapat?           |
| ----------------- | ----------------------- | --------------------- |
| `shadcn` CLI      | ✅ removed (`b147d11`)  | Tidak                 |
| `@shadcn/helpers` | ✅ removed (own engine) | Tidak (dev-only)      |
| `@shadcn/react`   | ⏳ rewrite next session | Ya (message-scroller) |

## Gotchas — Active

### PowerShell (critical)

- **#18:** single-quote tidak interpret backtick. Untuk newline multi-line pakai array literal + `WriteAllLines`. Detail di archive.

### Build & registry

- **#9:** jangan `Get-Content`/`Set-Content` untuk baca/tulis source — pakai `[IO.File]::ReadAllText/WriteAllText` dengan `UTF8Encoding($false)`. Emoji/multibyte korup dengan `Get-Content`.
- **#2:** `$file:` di string PowerShell = parse error. Pakai `${file}:`.
- **#3:** `-ForegroundColor` hanya valid di `Write-Host`.
- **#15 (nvm4w):** `npm run build` via `cmd.exe /c "npm run build > build.log 2>&1"` (bukan `& npm` langsung).
- **#19 (PS 5.1):** `[IO.File]::AppendAllLines` tidak ada — pakai `ReadAllText + join + WriteAllText`.
- **#23 (registry):** `detectImports` regex catch `from "X"` di komentar. Hindari pattern `from "literal"` di komentar `registry/*.tsx` atau `lib/icons.ts`.
- **#21 (regdeps):** `registry/*.tsx` yang import `@/lib/icons` wajib punya regdep `icons`.
- **#22 (Phosphor):** nama ekspor beda dari Lucide (`TextBolder`→`TextB`). Alias `as XIcon` wajib.
- **Turbopack:** jangan taruh `.bak` di `components/`, `app/`, `lib/`. Taruh di `C:\Users\PC\Desktop\frakment-baks\`.

### Lefthook (pre-commit + pre-push)

- **#24:** hook pre-commit jalankan format+lint+typecheck; pre-push jalankan build+test. Gagal hook → fix, ulang. JANGAN `--no-verify`. Detail di archive.

- **#25:** `lib/ai/**` override allow 6 rule (method-sig, prefer-export, promise, no-use-before-def, complexity, no-inner-decl) — wajib match contract.

### Component / styling

- **#8:** Radix classic pakai `asChild`, shadcn Nova pakai `render={}`. Frakment = `asChild`.
- **#5:** `Select` Frakment tidak terima `items` prop. Signature: `value? defaultValue? onValueChange?`.
- **#6:** Radix Select jangan `value=""` — rusak.
- **#7:** `Button` tidak dukung `data-icon` prop.
- **#11:** `MessageAnimated` alignment = `isUser ? "end" : "start"`. Jangan ubah.
- **#17:** Radix `ToggleGroup` **wajib** prop `type` (`"single"`/`"multiple"`).
- **#16:** ikon baru di `lib/icons.ts` wajib alias `as XIcon` kalau demo pakai suffix `Icon`. Tanpa itu → `Element type is invalid`.

### CSS / theme

- **#13:** `@custom-variant data-*` hanya di `theme.css`. Jangan duplikat di `globals.css`.
- **#14:** Scrollbar custom di `theme.css` — Chrome Windows paint track bg di compositor (tidak bisa 100% transparent). Diterima.

### Distribusi

- **#20:** `package-lock.json` masih ada `lucide-react` transitive dari fumadocs. Normal.

**Gotcha #1–14 detail lengkap** ada di `HANDOFF.archive/README.md`.

## Workflow

1. AI **selalu** copy-paste script ke PowerShell (no fs access).
2. Script tulis file → **wajib diakhiri verifikasi** (`Test-Path` / `Get-FileHash` / `.Contains`).
3. Script >10 baris / multi-line → **pecah per-chunk** (2-4 chunk), tunggu output tiap chunk.
4. **Build verify** sebelum commit (`BUILD_EXIT=0`). Error → baca tail `build.log` 25 baris **dulu**, jangan fix buta.
5. **Commit + push + HANDOFF update per phase.** Jangan tumpuk banyak phase dalam 1 commit.
6. **1 commit per phase**: tulis code → update HANDOFF → commit code + HANDOFF **bareng**. Hash di `git log`.

## Verification Commands

- **Build:** `Set-Location "C:\Users\PC\Desktop\frakment"; cmd.exe /c "npm run build > build.log 2>&1"; Write-Output "BUILD_EXIT=$LASTEXITCODE"`
- **Typecheck:** `cmd.exe /c "npm run typecheck > tc.log 2>&1"; Write-Output "TC_EXIT=$LASTEXITCODE"`
- **Lint+format check:** `cmd.exe /c "npm run check > check.log 2>&1"; Write-Output "CHECK_EXIT=$LASTEXITCODE"`
- **Lint+format fix:** `cmd.exe /c "npm run fix > fix.log 2>&1"; Write-Output "FIX_EXIT=$LASTEXITCODE"`
- **Registry:** `cmd.exe /c "npm run registry:build > reg.log 2>&1"; Write-Output "REG_EXIT=$LASTEXITCODE"`
- **Commit+push:** `git add -A; git commit -m "..."; git push 2>&1 | Write-Output; Write-Output "PUSH_EXIT=$LASTEXITCODE"`

## Design Decisions (jangan ubah tanpa diskusi)

### Framing

Untuk kode yang ditulis ulang: dilarang pakai kata **port / ported / 1:1 / parity / reference implementation / clone / copas / fork**. Pakai **"first-party, written from scratch"** / **"written to match the API contract"** / **"contract-first"**. Berlaku di komentar `lib/ai/*`, MDX, changelog, HANDOFF, commit/PR. Exception: `git clone`, `structuredClone`, `url.clone()`, `cloned` var.

- **Theme inline** di `styles/theme.css` (source of truth, distribusi user via `cli/templates/theme.css`). SHA256 wajib identik.
- **`lib/icons.ts`** = Phosphor shim. Import ikon lewat `@/lib/icons`, bukan `@phosphor-icons/react` atau `lucide-react`.
- **Button** pakai `asChild` (classic Radix).
- **CSS custom variant** (`data-*`) hanya di `theme.css`.
- **Registry source** = `registry/*.tsx`, site copy = `components/ui/*.tsx`. SHA256 wajib identik.
- **`meta.json`** urut alfabetis, 20 halaman.
- **Demo wrapper**: shrink-wrap (`w-fit`) → auto-center. `w-full max-w-sm` untuk vertical layout saja.

### SESSION_UPDATE: @shadcn/helpers rewrite — complete

- **Status:** done (11/11 phase, all ✅)
- **Files:** 11 files `lib/ai/` + `lib/ai.ts` re-export.
- **Verifikasi:** build EXIT=0 · typecheck EXIT=0 · check EXIT=0 · test 39/39
- **Detail:** contract-complete; helper uninstalled; demos verified.
- **Next:** rewrite `@shadcn/react` (message-scroller engine) — separate plan
- **Gotcha baru:** #25 (lihat Active Gotchas).

## Changelog Policy

Changelog = `content/docs/changelog/YYYY-MM-DD.mdx` (1 per tanggal, immutable). Wajib **hanya untuk perubahan library/package user-facing**.

**Wajib:** komponen registry baru, API publik berubah, style/behavior user-visible, CLI command/flag baru, publish/rename package, breaking change di `lib/ai`/`theme.css`/registry schema.

**Skip:** komponen site-only (card/tooltip/dropdown-menu = demo only), docs typo, demo polish, refactor internal, dev tooling, docs pages non-komponen, site UI (sidebar/header/new dot).

**Format:** frontmatter `title` (human), `description`, `date` (ISO). Body: intro + TOC + `<hr>` + `### Section` + prose/`<Steps>`/code diff + cross-link.

## Changelog Format Template

Acuan: `content/docs/changelog/2026-10-31.mdx`. Copy polanya (bukan 2026-11-02):

- **Frontmatter:** `title` (Month DD, YYYY), `description` (one-liner), `date` (YYYY-MM-DD ISO)
- **Import demo** setelah frontmatter: `import { XxxDemo } from "@/examples/xxx-demo";` (wajib kalau ada `<ComponentPreview>`)
- **Intro paragraph:** bold **fitur utama** + inline link docs
- **TOC bullet:** `- [Feature](#anchor): One-line.`
- `<hr className="my-16 border-border/40" />` **antar `###`** (bukan antar `####`)
- `### Feature` — prose 2-3 kalimat (masalah → solusi), bukan bullet list
- `#### Installation` — `<Steps>` + `npx frakment add xxx` + `import` snippet
- `#### What it looks like` — `<ComponentPreview name="xxx" title="xxx.tsx"><XxxDemo /></ComponentPreview>` (wajib kalau ada demo file)
- `#### Minimal usage` — code block `tsx` + `See the [Xxx docs](/docs/components/xxx).`
- **Bahasa EN konsisten.** 1 file per tanggal, immutable setelah push.

**Gotcha:** draft v1 (bullet tanpa prose/preview) salah. Pakai pola 2026-10-31.

## New Dot + New/All Split

- `PAGES_NEW: ReadonlySet<string>` di `lib/docs.ts` — URL "new".
- `lib/source.tsx` — `decorateNode()` wraps `page.name` → `<NewDot className="ml-auto" />` untuk URL di `PAGES_NEW`. Tree sama dipakai sidebar + mobile nav + breadcrumb.
- `components/components-list.tsx` — prop `filter: "all" | "new" | "current"` (default `all`). `new` = in `PAGES_NEW`; `current` = not in.
- Index `components` + `ai-elements` → `## New X` (`filter="new"`) + `## All X` (`filter="current"`). `meta.json` A-Z, no separator.
- `NewDot` (`components/new-dot.tsx`) — `size-1.5 rounded-full bg-blue-500`.

**Rilis baru:** MDX + entry `meta.json` (A-Z) + entry `frakment.json` + `registry:build` + URL ke `PAGES_NEW`. **Graduasi:** hapus dari `PAGES_NEW`. MDX/meta tidak disentuh. Dot hilang otomatis.

## Recent Commits (5 terbaru — detail `git log`)

| Hash      | Summary                                             |
| --------- | --------------------------------------------------- |
| _(next)_  | Monorepo conversion + changesets                    |
| `f3d1d18` | split archive folder + restore gotchas + 15KB limit |
| `b147d11` | remove shadcn CLI                                   |
| `77b5108` | handoff lucide→phosphor                             |
| `644fc04` | lucide→phosphor migration (54 files)                |
| `7cb9244` | scrollbar + card radius + message-scroller sync     |

## SESSION_UPDATE Template

Setiap **phase** selesai → append 1 entry ringkas (≤10 baris). Jangan tulis per sub-task:

```markdown
### SESSION_UPDATE: <judul singkat> — <hash>

- **Status:** done / partial (<X>/<Y> phase)
- **Files:** <count> changed, <additions>+/<deletions>-
- **Verifikasi:** build EXIT=0 · typecheck EXIT=0 · check EXIT=0 · test 39/39
- **Detail:** <1–2 baris>
- **Next:** <phase/fitur berikutnya, atau "none">
- **Gotcha baru:** <#25 ...> (opsional)
```

**Jangan** tulis ulang full history. Kalau butuh detail: `HANDOFF.archive/README.md` + `git log`.

## Maintenance Rules

- **Setiap phase selesai** → update phase tracker (⏳ → ✅) → commit code + HANDOFF bareng. Hash di `git log`.
- **Setiap batch fitur selesai** → append 1 SESSION_UPDATE ringkas (template di bawah).
- **Setiap gotcha baru** → tambahkan 1 baris terse di Gotchas Active. Detail lengkap → `HANDOFF.archive/gotchas.md`.
- **Setiap perubahan library user-facing** → update changelog (`content/docs/changelog/YYYY-MM-DD.mdx`). Lihat Changelog Policy. Site/dev-only = skip.
- **HANDOFF.md ≤ 15 KB.** Kalau lewat → extract section besar ke `HANDOFF.archive/<topic>.md` + sisakan 1 baris pointer + update Archive Index. Jangan hapus konten, selalu pindah.
- **`HANDOFF.archive/` unlimited.** Semua detail lama tetap di sana untuk grep. Setiap file archive punya link balik `↑ Back to HANDOFF` + TOC.
- **Bidirectional link wajib.** HANDOFF → Archive Index → setiap file. Setiap file archive → HANDOFF + Archive README.
- **Setiap commit/push:** `BUILD_EXIT=0` + `TC_EXIT=0` + `CHECK_EXIT=0`. Hook pre-commit & pre-push akan jalankan otomatis.
