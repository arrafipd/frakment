# Frakment — HANDOFF

> **Historical log lengkap** (semua SESSION_UPDATE lama, gotcha full text, patterns detail): `HANDOFF.archive.md`. Grep di sana kalau butuh detail.

## Current State

- Branch `main` = `origin/main`, working tree clean.
- Build `EXIT=0` (159 pages), typecheck `EXIT=0`, test **39/39**, registry **29 components**.
- Shadcn deps remaining: `@shadcn/react` (runtime, user dapat via message-scroller), `@shadcn/helpers` (dev-only, demo).

## Active Plan — `@shadcn/helpers` port

**Status: COMPLETE.** External helper replaced with own engine at `lib/ai/` (11 modules + `lib/ai.ts` re-export). Behavior 1:1 parity. Package uninstalled. Details: `HANDOFF.archive.md` + `git log -- lib/ai/`.

**Next:** `@shadcn/react` port (message-scroller engine) — separate session, plan in archive.

## Component Registry (29)

29 components — lihat `frakment.json`.

## Docs Pages (20, di `meta.json`)

20 pages di `meta.json` (components + ai-elements + libraries).

## Shadcn Status

| Package           | Status                  | User dapat?           |
| ----------------- | ----------------------- | --------------------- |
| `shadcn` CLI      | ✅ removed (`b147d11`)  | Tidak                 |
| `@shadcn/helpers` | ✅ removed (own engine) | Tidak (dev-only)      |
| `@shadcn/react`   | ⏳ port next session    | Ya (message-scroller) |

## Gotchas — Active

### PowerShell (critical)

- **#18:** single-quote tidak interpret backtick. Untuk newline multi-line pakai array literal + `WriteAllLines`. Detail di archive.

### Build & registry

- **#15 (nvm4w):** `npm run build` via `cmd.exe /c "npm run build > build.log 2>&1"` (bukan `& npm` langsung).
- **#19 (PS 5.1):** `[IO.File]::AppendAllLines` tidak ada — pakai `ReadAllText + join + WriteAllText`.
- **#23 (registry):** `detectImports` regex catch `from "X"` di komentar. Hindari pattern `from "literal"` di komentar `registry/*.tsx` atau `lib/icons.ts`.
- **#21 (regdeps):** `registry/*.tsx` yang import `@/lib/icons` wajib punya regdep `icons`.
- **#22 (Phosphor):** nama ekspor beda dari Lucide (`TextBolder`→`TextB`). Alias `as XIcon` wajib.
- **Turbopack:** jangan taruh `.bak` di `components/`, `app/`, `lib/`. Taruh di `C:\Users\PC\Desktop\frakment-baks\`.

### Lefthook (pre-commit + pre-push)

- **#24:** hook pre-commit jalankan format+lint+typecheck; pre-push jalankan build+test. Gagal hook → fix, ulang. JANGAN `--no-verify`. Detail di archive.

- **#25:** `lib/ai/**` override allow 6 rule (method-sig, prefer-export, promise, no-use-before-def, complexity, no-inner-decl) — wajib port 1:1.

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

**Gotcha #1–14 detail lengkap** ada di `HANDOFF.archive.md`.

## Workflow

1. AI copy-paste script ke PowerShell (no fs access). Script tulis file wajib diakhiri verifikasi (`Test-Path` / `Get-FileHash` / `.Contains`).
2. Script >10 baris → pecah per-chunk (2-4 chunk), tunggu output tiap chunk.
3. **Build verify** sebelum commit (`BUILD_EXIT=0`). Error → baca tail build.log 25 baris dulu.
4. Commit + push + HANDOFF update per phase. Jangan tumpuk.

## Verification Commands

- **Build:** `cmd.exe /c "npm run build > build.log 2>&1"; Write-Output "BUILD_EXIT=$LASTEXITCODE"`
- **Typecheck:** `cmd.exe /c "npm run typecheck > tc.log 2>&1"; Write-Output "TC_EXIT=$LASTEXITCODE"`
- **Lint+format:** `cmd.exe /c "npm run check > check.log 2>&1"` (auto-fix: `npm run fix`)
- **Registry:** `cmd.exe /c "npm run registry:build > reg.log 2>&1"`
- **Commit+push:** `git add -A; git commit -m "..."; git push`

## Design Decisions (jangan ubah tanpa diskusi)

- **Theme inline** di `styles/theme.css` (source of truth, distribusi user via `cli/templates/theme.css`). SHA256 wajib identik.
- **`lib/icons.ts`** = Phosphor shim. Import ikon lewat `@/lib/icons`, bukan `@phosphor-icons/react` atau `lucide-react`.
- **Button** pakai `asChild` (classic Radix).
- **CSS custom variant** (`data-*`) hanya di `theme.css`.
- **Registry source** = `registry/*.tsx`, site copy = `components/ui/*.tsx`. SHA256 wajib identik.
- **`meta.json`** urut alfabetis, 20 halaman.
- **Demo wrapper**: shrink-wrap (`w-fit`) → auto-center. `w-full max-w-sm` untuk vertical layout saja.

### SESSION_UPDATE: @shadcn/helpers full port — complete

- **Status:** done (11/11 phase, all ✅)
- **Files:** 11 new di `lib/ai/` + `lib/ai.ts` re-export.
- **Verifikasi:** build EXIT=0 · typecheck EXIT=0 · check EXIT=0 · test 39/39
- **Detail:** 100% behavior match; `@shadcn/helpers` uninstalled; demos parity-checked.
- **Next:** `@shadcn/react` port (message-scroller engine) — separate plan
- **Gotcha baru:** #25 (lihat Active Gotchas).

## Changelog Policy

Changelog = `content/docs/changelog/YYYY-MM-DD.mdx` (1 per tanggal, immutable). Wajib **hanya untuk perubahan library/package user-facing**.

**Wajib:** komponen registry baru, API publik berubah, style/behavior user-visible, CLI command/flag baru, publish/rename package, breaking change di `lib/ai`/`theme.css`/registry schema.

**Skip:** komponen site-only (card/tooltip/dropdown-menu = demo only), docs typo, demo polish, refactor internal, dev tooling, docs pages non-komponen, site UI (sidebar/header/new dot).

**Format:** frontmatter `title` (human), `description`, `date` (ISO). Body: intro + TOC + `<hr>` + `### Section` + prose/`<Steps>`/code diff + cross-link.

## Changelog Format Template

Acuan rich: `content/docs/changelog/2026-10-31.mdx`. Wajib copy polanya (bukan 2026-11-02 yang kurang `<ComponentPreview>`):

- **Frontmatter:** `title` (Month DD, YYYY), `description` (one-liner), `date` (YYYY-MM-DD ISO)
- **Import demo** setelah frontmatter — `import { XxxDemo } from "@/examples/xxx-demo";` (wajib kalau ada `<ComponentPreview>`)
- **Intro paragraph:** bold **fitur utama** + inline link docs
- **TOC bullet:** `- [Feature](#anchor): One-line.`
- `<hr className="my-16 border-border/40" />` **antar `###`** (bukan antar `####`)
- `### Feature` — prose 2-3 kalimat (masalah → solusi), bukan bullet list
- `#### Installation` — `<Steps>` + `npx frakment add xxx` + `import` snippet
- `#### What it looks like` — `<ComponentPreview name="xxx" title="xxx.tsx"><XxxDemo /></ComponentPreview>` (wajib kalau ada demo file)
- `#### Minimal usage` — code block `tsx` + `See the [Xxx docs](/docs/components/xxx).`
- **Bahasa EN konsisten.** 1 file per tanggal, immutable setelah push.

**Gotcha:** draft 2026-11-03 v1 (bullet list tanpa prose/preview) salah. Revisi pakai pola 2026-10-31.

## New Dot + New/All Split

- `PAGES_NEW: ReadonlySet<string>` di `lib/docs.ts` — URL yang dianggap "new".
- `lib/source.tsx` — `decorateNode()` wraps `page.name` → `<NewDot className="ml-auto" />` untuk URL di `PAGES_NEW`. Tree sama → sidebar + mobile nav + breadcrumb dapat dot otomatis.
- `components/components-list.tsx` — prop `filter: "all" | "new" | "current"` (default `all`). `new` = in `PAGES_NEW`; `current` = not in.
- Index `components` + `ai-elements` → `## New X` (`filter="new"`) + `## All X` (`filter="current"`). `meta.json` A-Z, no separator.
- `NewDot` (`components/new-dot.tsx`) — `size-1.5 rounded-full bg-blue-500`, `aria-label="New"`.

**Rilis baru:** MDX + entry `meta.json` (A-Z) + entry `frakment.json` + `registry:build` + URL ke `PAGES_NEW`. **Graduasi:** hapus dari `PAGES_NEW`. MDX/meta tidak disentuh. Dot hilang otomatis.

## Recent Commits (5 terbaru — detail di `git log`)

| Hash      | Summary                                         |
| --------- | ----------------------------------------------- |
| _(next)_  | Libraries + changelog + new dot + lib/ai port   |
| `b147d11` | remove shadcn CLI                               |
| `77b5108` | handoff lucide→phosphor                         |
| `644fc04` | lucide→phosphor migration (54 files)            |
| `7cb9244` | scrollbar + card radius + message-scroller sync |

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

**Jangan** tulis ulang full history. Kalau butuh detail: `HANDOFF.archive.md` + `git log`.

## Maintenance Rules

- **Setiap phase selesai** → update phase tracker (⏳ → ✅) → commit code + HANDOFF bareng. Hash di `git log`.
- **Setiap batch fitur selesai** → append 1 SESSION_UPDATE ringkas (template di atas).
- **Setiap gotcha baru** → tambahkan 1 baris di section Gotchas Active. Kalau >20, pindahkan yang jarang ke archive.
- **Setiap perubahan library user-facing** → update changelog (`content/docs/changelog/YYYY-MM-DD.mdx`). Lihat Changelog Policy. Site-only/dev-only = skip.
- **HANDOFF.md ≤ 10 KB.** Lewat → kompres atau pindah ke archive.
- **Sebelum commit:** build EXIT=0 + typecheck EXIT=0 + check EXIT=0 + git status clean + HANDOFF ≤10 KB.
- **Sebelum push:** hook pre-push akan jalankan build + test; pastikan keduanya hijau.
