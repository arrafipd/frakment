# Frakment — HANDOFF

> **Historical log lengkap** (semua SESSION_UPDATE lama, gotcha full text, patterns detail): `HANDOFF.archive.md`. Grep di sana kalau butuh detail.

## Current State

- Branch `main` = `origin/main`, working tree clean.
- Build `EXIT=0` (159 pages), typecheck `EXIT=0`, test **39/39**, registry **29 components**.
- Shadcn deps remaining: `@shadcn/react` (runtime, user dapat via message-scroller), `@shadcn/helpers` (dev-only, demo).

## Active Plan — `@shadcn/helpers` port (zero shadcn engine)

**Goal:** replace `@shadcn/helpers` with own engine, behavior 100% match. All features: turn scripting, continuation, tools, approvals, files, sources, fallback, ChatTransport.

**Architecture:** split under `lib/ai/` — `types.ts`, `ids.ts`, `utils.ts`, `payloads.ts`, `envelope.ts`, `stream.ts`, `writer.ts`, `builder.ts`, `transport.ts`, `adapter.ts`, `index.ts`. `lib/ai.ts` re-exports public API (`createChat`, `getMessageText`) — import path unchanged.

**Phase tracker (per-phase: commit + push + this table update):**

| Phase | File                                                    | Status |
| ----- | ------------------------------------------------------- | ------ |
| -1    | HANDOFF compact + plan                                  | ✅     |
| 0     | `lib/ai/types.ts`                                       | ✅     |
| 1     | `ids.ts` + `utils.ts` + `payloads.ts`                   | ✅     |
| 2     | `envelope.ts` + `stream.ts`                             | ✅     |
| 3     | `writer.ts`                                             | ✅     |
| 4     | `builder.ts` core (user/assistant/error/sleep/get/next) | ✅     |
| 5     | `builder.ts` continuation (callback, tools, approvals)  | ✅     |
| 6     | `transport.ts`                                          | ✅     |
| 7     | `adapter.ts`                                            | ✅     |
| 8     | `index.ts` + `lib/ai.ts` re-export + build verify       | ✅     |
| 9     | Parity test 3 demo + uninstall `@shadcn/helpers`        | ⏳     |
| 10    | HANDOFF final                                           | ⏳     |

**Reference source:** `node_modules/@shadcn/helpers/dist/chat-ChArRzRi.d.ts` (types), `dist/ai-sdk/index.js` (adapter), `dist/chunk-ZEGKA56A.js` (builder + utilities).

**Resume:** baca tabel, lanjut dari phase pertama yang ⏳. Setiap phase selesai → commit + push + update tabel.

## Component Registry (29)

`avatar, badge, bubble, button, chain-of-thought, checkbox, code-block, empty, field, icons, input, input-group, item, label, marker, message-animated, message-scroller, message, pulse-status, pulse, select, separator, spinner, switch, terminal, textarea, toggle, toggle-group, tooltip, trace`

## Docs Pages (20, di `meta.json`)

`avatar, badge, button, card, checkbox, code-block, dropdown-menu, empty, field, input, input-group, item, label, select, separator, switch, textarea, toggle, toggle-group, tooltip`

## Shadcn Status

| Package           | Status                 | User dapat?           |
| ----------------- | ---------------------- | --------------------- |
| `shadcn` CLI      | ✅ removed (`b147d11`) | Tidak                 |
| `@shadcn/helpers` | ⏳ port in progress    | Tidak (dev-only)      |
| `@shadcn/react`   | ⏳ port next session   | Ya (message-scroller) |

## Gotchas — Active

### PowerShell (critical)

- **#18:** single-quote tidak interpret backtick. Untuk newline multi-line pakai array literal + `WriteAllLines`. Detail di archive.
- **#9:** jangan `Get-Content`/`Set-Content` untuk baca/tulis source — pakai `[IO.File]::ReadAllText/WriteAllText` dengan `UTF8Encoding($false)`.
- **#2:** `$file:` = parse error. Pakai `${file}:`.
- **#3:** `-ForegroundColor` hanya untuk `Write-Host`.

### Build & registry

- **#15 (nvm4w):** `npm run build` dari PowerShell bisa `Unknown command: "pm"`. **Selalu** `cmd.exe /c "npm run build > build.log 2>&1"`.
- **#19 (PS 5.1):** `[IO.File]::AppendAllLines` tidak ada. Pakai `ReadAllText + join + WriteAllText`.
- **#23 (registry):** `detectImports` regex catch `from "X"` di komentar. Hindari pattern `from "literal"` di komentar `registry/*.tsx` atau `lib/icons.ts`.
- **#21 (regdeps):** `registry/*.tsx` yang import `@/lib/icons` wajib punya regdep `icons`.
- **#22 (Phosphor):** nama ekspor tidak selalu match Lucide (`TextBolder`→`TextB`, `WrapText`→`Paragraph`). Verifikasi via `node_modules\@phosphor-icons\react\dist\ssr\Name*.d.ts`. Alias `Name as XIcon` wajib untuk suffix Lucide-style.
- **Turbopack:** jangan taruh `.bak` di `components/`, `app/`, `lib/`. Taruh di `C:\Users\PC\Desktop\frakment-baks\`.

### Lefthook (pre-commit + pre-push)

- **#24:** hook pre-commit jalankan format+lint+typecheck; pre-push jalankan build+test. Gagal hook → fix, ulang. JANGAN `--no-verify`. Detail di archive.

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

1. **Selalu** copy-paste script, AI tidak punya akses filesystem.
2. Script yang menulis file **wajib diakhiri verifikasi** (`Test-Path`, `Get-FileHash`, `[IO.File]::ReadAllText().Contains(...)`).
3. Script panjang (>10 baris / multi-line) **pecah per-chunk** (2–4 chunk), tunggu output tiap chunk.
4. **Build verifikasi** sebelum commit: `BUILD_EXIT=0`.
5. **1 commit per phase**: tulis code → update HANDOFF (mark phase ✅) → commit code + HANDOFF **bareng**. Hash tercatat di `git log`, tidak perlu di HANDOFF.
6. Kalau error build: **baca tail build.log 25 baris** dulu, jangan fix buta.

## Verification Commands (copy-paste)

**Build:** `Set-Location "C:\Users\PC\Desktop\frakment"; cmd.exe /c "npm run build > build.log 2>&1"; Write-Output "BUILD_EXIT=$LASTEXITCODE"`

**Typecheck:** `cmd.exe /c "npm run typecheck > tc.log 2>&1"; Write-Output "TC_EXIT=$LASTEXITCODE"`

**Lint + format check:** `cmd.exe /c "npm run check > check.log 2>&1"; Write-Output "CHECK_EXIT=$LASTEXITCODE"`

**Lint + format auto-fix:** `cmd.exe /c "npm run fix > fix.log 2>&1"; Write-Output "FIX_EXIT=$LASTEXITCODE"`

**Registry rebuild:** `cmd.exe /c "npm run registry:build > reg.log 2>&1"; Write-Output "REG_EXIT=$LASTEXITCODE"`

**Commit + push:** `git add -A; git commit -m "..."; git push 2>&1 | Write-Output; Write-Output "PUSH_EXIT=$LASTEXITCODE"`

## Design Decisions (jangan ubah tanpa diskusi)

- **Theme inline** di `styles/theme.css` (source of truth, distribusi user via `cli/templates/theme.css`). SHA256 wajib identik.
- **`lib/icons.ts`** = Phosphor shim. Import ikon lewat `@/lib/icons`, bukan `@phosphor-icons/react` atau `lucide-react`.
- **Button** pakai `asChild` (classic Radix).
- **CSS custom variant** (`data-*`) hanya di `theme.css`.
- **Registry source** = `registry/*.tsx`, site copy = `components/ui/*.tsx`. SHA256 wajib identik.
- **`meta.json`** urut alfabetis, 20 halaman.
- **Demo wrapper**: shrink-wrap (`w-fit`) → auto-center. `w-full max-w-sm` untuk vertical layout saja.

## Recent Commits (10 terbaru — detail di `git log`)

| Hash      | Type     | Summary                                         |
| --------- | -------- | ----------------------------------------------- |
| `b147d11` | chore    | remove shadcn CLI                               |
| `77b5108` | docs     | handoff lucide→phosphor                         |
| `644fc04` | refactor | lucide→phosphor migration (54 files)            |
| `7cb9244` | polish   | scrollbar + card radius + message-scroller sync |
| `263424d` | docs     | handoff toggle/card/tooltip/dropdown            |
| `819b68b` | feat     | card, tooltip, dropdown-menu docs + 13 demos    |
| `6b6f84d` | feat     | toggle + toggle-group + 12 demos                |
| `65a3f9a` | feat     | message-scroller-demo 4 exchanges               |
| `cd70a8f` | feat     | card upgrade + demo polish                      |
| `fcedf0f` | docs     | handoff preview off-center fix                  |

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
- **HANDOFF.md ≤ 10 KB.** Lewat → kompres atau pindah ke archive.
- **Sebelum commit:** build EXIT=0 + typecheck EXIT=0 + check EXIT=0 + git status clean + HANDOFF ≤10 KB.
- **Sebelum push:** hook pre-push akan jalankan build + test; pastikan keduanya hijau.
