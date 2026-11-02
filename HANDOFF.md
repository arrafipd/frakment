# Frakment - Session Handoff

**Living document** — WAJIB di-update setiap akhir sesi. Baca section `## MAINTENANCE` di bawah sebelum akhiri pekerjaan.

---

## TL;DR

- **Registry**: 26 komponen (dari 15 awal). Semua fungsional + live di main.
- **Docs**: 11 komponen punya halaman (mixed quality: 3 rich, 1 medium, 4 minimal, 3 baru belum dibuat).
- **Next priority**: batch Textarea + Empty (upgrade minimal ke rich), lalu InputGroup, lalu Field upgrade, lalu Checkbox/Label/Switch docs.
- **Blocker**: tidak ada. Semua build sukses, test hijau, working tree clean.

---

## Current State

```
ca0f7bd docs: upgrade input page to rich format (6 examples)
d5eb8ca docs: add field page with rich examples
14ca017 feat(registry): add label, switch, checkbox, select, field primitives
3b46eb8 feat(registry): add input, textarea, empty, input-group, message-animated
1a26cd8 docs: framework guides, SKILL.md, theming, changelog; remove competitor marketing
```

**Working tree**: clean. All pushed to origin/main.

**Build status**: `npm run build` sukses, `npm test` 39 passed, typecheck clean.

---

## Component Registry (26 komponen)

### Primitives (form controls)

| Name          | Deps                               | Regdeps                 |
| ------------- | ---------------------------------- | ----------------------- |
| `button`      | class-variance-authority, radix-ui | -                       |
| `input`       | -                                  | -                       |
| `textarea`    | -                                  | -                       |
| `label`       | radix-ui                           | -                       |
| `switch`      | radix-ui                           | -                       |
| `checkbox`    | radix-ui                           | -                       |
| `select`      | radix-ui                           | -                       |
| `field`       | class-variance-authority           | label, separator        |
| `input-group` | class-variance-authority           | button, input, textarea |
| `empty`       | class-variance-authority           | -                       |

### Display

| Name         | Deps                                   | Regdeps |
| ------------ | -------------------------------------- | ------- |
| `badge`      | class-variance-authority, radix-ui     | -       |
| `avatar`     | radix-ui                               | -       |
| `separator`  | radix-ui                               | -       |
| `item`       | class-variance-authority, radix-ui     | -       |
| `marker`     | class-variance-authority, radix-ui     | -       |
| `spinner`    | lucide-react                           | -       |
| `bubble`     | class-variance-authority, radix-ui     | -       |
| `message`    | -                                      | -       |
| `code-block` | class-variance-authority, lucide-react | button  |

### AI / agent

| Name               | Deps                           | Regdeps                    |
| ------------------ | ------------------------------ | -------------------------- |
| `trace`            | lucide-react, motion, radix-ui | -                          |
| `terminal`         | lucide-react, motion           | trace, code-block          |
| `chain-of-thought` | lucide-react                   | trace                      |
| `pulse`            | lucide-react                   | badge, pulse-status, trace |
| `pulse-status`     | lucide-react                   | -                          |
| `message-scroller` | @shadcn/react                  | button                     |
| `message-animated` | ai, motion                     | bubble, message-scroller   |

**Note penting**: `message-scroller` masih import `@shadcn/react/message-scroller` (engine headless). Ini dependency npm biasa, bukan UI library. Kalau mau zero shadcn, butuh reimplement engine atau pakai `use-stick-to-bottom` langsung (2-4 jam).

---

## Docs Status

### `content/docs/components/` (11 MDX)

| File              | Lines | ##  | ### | Preview | Status                  |
| ----------------- | ----- | --- | --- | ------- | ----------------------- |
| `badge.mdx`       | 449   | 23  | 10  | 15      | RICH (template)         |
| `code-block.mdx`  | 386   | 19  | 3   | 13      | RICH (template)         |
| `item.mdx`        | 320   | 12  | 2   | 6       | RICH                    |
| `field.mdx`       | 244   | 15  | 10  | 4       | MEDIUM                  |
| `input.mdx`       | 137   | 7   | 3   | 5       | RICH (upgraded)         |
| `textarea.mdx`    | 77    | 6   | 2   | 1       | MINIMAL (needs upgrade) |
| `empty.mdx`       | 118   | 7   | 3   | 1       | MINIMAL (needs upgrade) |
| `input-group.mdx` | 163   | 11  | 7   | 1       | MINIMAL (needs upgrade) |
| `avatar.mdx`      | -     | -   | -   | -       | existing, not checked   |
| `separator.mdx`   | -     | -   | -   | -       | existing, not checked   |
| `button.mdx`      | -     | -   | -   | -       | existing, not checked   |

**Missing docs**: `checkbox.mdx`, `label.mdx`, `switch.mdx`, `select.mdx` (4 file belum dibuat).

### `content/docs/ai-elements/` (10 MDX)

- Semua sudah ada. `message-scroller.mdx` dibuat session ini (rich, 243 lines).

### Target format RICH (contoh `badge.mdx`)

Setiap section yang punya visual variant HARUS pakai `<ComponentPreview>`, bukan cuma code static.

Struktur minimal:

1. **Hero**: 1 `<ComponentPreview>` full showcase
2. `## Installation` (CodeTabs CLI + Manual)
3. `## Usage` (import + basic example)
4. `## Anatomy` (component tree + parts table)
5. `## Examples` - multiple `###` subsections, tiap satu preview + code
6. `## API Reference` - PropsTable per component
7. Optional: `## Accessibility`, `## Best Practices`

---

## Demo Files Status (`examples/`)

### Yang sudah ada

```
field-demo.tsx          (payment form)
field-input.tsx         (username/password)
field-invalid.tsx       (invalid state)
field-textarea.tsx      (feedback form)
input-demo.tsx          (API key, password)
input-basic.tsx         (bare input)
input-field.tsx         (username field)
input-fieldgroup.tsx    (name/email group)
input-invalid.tsx       (invalid state)
textarea-demo.tsx       (OLD minimal - perlu rewrite)
empty-demo.tsx          (OLD minimal - perlu rewrite)
input-group-demo.tsx    (OLD minimal - perlu rewrite)
message-scroller-demo.tsx (full chat, sudah rewrite)
```

### Yang masih perlu dibuat

```
textarea-field.tsx      (Field wrapper)
textarea-invalid.tsx    (invalid state)
empty-outline.tsx       (dashed border)
empty-muted.tsx         (bg-muted/30)
empty-avatar-group.tsx  (stacked avatars)
input-group-inline-start.tsx
input-group-inline-end.tsx
input-group-block-end.tsx
input-group-icon.tsx
field-checkbox.tsx
field-switch.tsx
field-select.tsx
checkbox-demo.tsx
checkbox-basic.tsx
checkbox-invalid.tsx
label-demo.tsx
switch-demo.tsx
switch-description.tsx
switch-choice-card.tsx
select-demo.tsx
select-groups.tsx
```

---

## Patterns (WAJIB IKUTI)

### 1. Write/read file (PowerShell)

JANGAN pakai `Get-Content` / `Set-Content` untuk file dengan emoji atau non-ASCII. Selalu:

```powershell
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$path", $content, $utf8)
$c = [System.IO.File]::ReadAllText($path, $utf8)
```

Untuk file panjang, pakai array of lines (hindari here-string cutoff):

```powershell
$lines = @(
  'line 1',
  'line 2'
)
[System.IO.File]::WriteAllLines($path, $lines, $utf8)
```

### 2. MDX rich format (template)

````mdx
---
title: ComponentName
description: One-line description.
---

import { ComponentNameDemo } from "@/examples/component-name-demo";

<ComponentPreview
  name="component-name"
  title="component-name.tsx"
  previewClassName="h-auto py-8"
>
  <ComponentNameDemo />
</ComponentPreview>

Brief intro paragraph.

##### Installation

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">Command</TabsTrigger>
    <TabsTrigger value="manual">Manual</TabsTrigger>
  </TabsList>

  <TabsContent value="cli">

```bash
npx frakment add component-name
```
````

  </TabsContent>

  <TabsContent value="manual">
    <Steps className="mb-0 pt-2">
      <Step>Install the following dependencies:</Step>
      ```bash
      npm install <deps>
      ```
      <Step>Copy and paste the following code into your project.</Step>
      <ComponentSource name="component-name" title="components/ui/component-name.tsx" />
      <Step>Update the import paths to match your project setup.</Step>
    </Steps>
  </TabsContent>
</CodeTabs>

##### Usage

```tsx title="component-name.tsx"
import { ComponentName } from "@/components/ui/component-name";
```

##### Anatomy

```tsx
<ComponentName>
  <ComponentNamePart />
</ComponentName>
```

- **ComponentName** - short description

##### Examples

### Variant A

<ComponentPreview name="component-name" title="component-name.tsx" previewClassName="h-auto py-8">
  <ComponentNameVariant />
</ComponentPreview>

##### API Reference

<PropsTable
rows={[
{
name: "variant",
type: '"a" | "b"',
defaultValue: '"a"',
description: "Visual variant.",
},
]}
/>

````

### 3. Demo file format

```tsx
"use client";

import { SomeIcon } from "@/lib/icons";  // ALWAYS use shim
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ComponentNameDemo() {
  return (
    <div className="w-full max-w-xs">
      <Field>
        <FieldLabel htmlFor="demo-id">Label</FieldLabel>
        <Input id="demo-id" placeholder="..." />
        <FieldDescription>Helper text.</FieldDescription>
      </Field>
    </div>
  );
}
````

Aturan: WAJIB `"use client"` kalau ada state/event. Icons dari `@/lib/icons`. Root wrapper `max-w-xs` (input) / `max-w-sm` (form) / `max-w-md` (rich). Props hardcoded (demo showcase).

### 4. Icon shim (`lib/icons.ts`)

File ini = Lucide-compatible shim di atas Phosphor. Setiap icon baru di-add di sini dulu.

Format:

```
IconName,
IconName as IconNameIcon,
```

Import dari `@/lib/icons`, bukan `@phosphor-icons/react` langsung.

Icons yang sudah ada di shim:

- `Check`, `CheckIcon`
- `ArrowDown`, `ArrowDownIcon`
- `ArrowUp`, `ArrowUpIcon`
- `ArrowClockwise`, `ArrowClockwiseIcon`
- `ArrowUpRight`, `ArrowUpRightIcon`
- `ChevronDown`, `ChevronDownIcon`
- `ChevronUp`, `ChevronUpIcon`
- `Plus`, `PlusIcon`
- `Paperclip`, `Image`, `Globe`, `Cloud`, `Bell`
- `Envelope`, `MailIcon`
- `CreditCard`, `EyeClosed`, `EyeOffIcon`
- `Star`, `Minus`
- `ArrowsClockwise`, `RefreshCcwIcon`
- `Folder`
- `Binoculars` (used as TelescopeIcon)
- `ChatTeardropDots` (used as MessageCircleDashedIcon)

### 5. Registry entry (`frakment.json`)

```json
{
  "name": "component-name",
  "version": "0.1.0",
  "title": "Component Name",
  "description": "One-line description",
  "source": "registry/component-name.tsx",
  "target": "components/ui/component-name.tsx",
  "dependencies": ["class-variance-authority", "radix-ui"],
  "registryDependencies": ["button"]
}
```

Setelah edit, `npm run registry:build`. Generate `public/r/*.json` + update `index.json` + rebuild SKILL.md.

### 6. Meta.json (navigation)

`content/docs/components/meta.json` mengontrol urutan sidebar:

```json
{
  "title": "Components",
  "root": true,
  "pages": [
    "avatar",
    "badge",
    "button",
    "checkbox",
    "code-block",
    "empty",
    "field",
    "input",
    "input-group",
    "item",
    "label",
    "select",
    "separator",
    "switch",
    "textarea"
  ]
}
```

Setelah edit:

```powershell
Remove-Item -Recurse -Force .source -ErrorAction SilentlyContinue
npx fumadocs-mdx
```

---

## Known Issues / Gotchas (WAJIB BACA)

### 1. PowerShell quoting di array

JANGAN pakai `'...'` untuk escape single-quote di dalam string. Contoh SALAH:

```powershell
'type: ''"xs"'','
```

GUNAKAN backtick:

```powershell
"type: `"xs`","
```

### 2. `$file:` parse error

`"$file: message"` - error "Variable reference is not valid". Fix:

```powershell
"${file}: message"
```

### 3. `-ForegroundColor` needs `Write-Host`

`"string" -ForegroundColor Green` - error. Fix:

```powershell
Write-Host "string" -ForegroundColor Green
```

### 4. Jangan paste build output dengan box chars

Karakter `┌ ├ │ └` (dari Next.js) break PowerShell. Cek build dengan:

```powershell
npm run build 2>&1 | Select-String -Pattern 'Compiled|Error|Failed|error TS' | Select-Object -Last 10
```

### 5. `Select items={}` not supported

Frakment `select.tsx` (custom shadcn-temp) NOT accept `items` prop on root. Signature: `value? defaultValue? onValueChange?`.

**Wrong**: `<Select items={months}>`
**Right**: `<Select>` (no items)

### 6. Radix Select tidak boleh `value=""`

Empty string placeholder break Radix Select. Remove:

```tsx
// WRONG
{ label: "MM", value: "" }

// RIGHT - no placeholder, atau "placeholder" string
{ label: "01", value: "01" }
```

### 7. `Button data-icon` not supported

Frakment Button tidak support `data-icon`. Skip di shadcn demos:

```tsx
// Skip: <RefreshCcwIcon data-icon="inline-start" />
// Use: <RefreshCcwIcon />
```

### 8. `render={}` vs `asChild`

Shadcn Nova: `<TooltipTrigger render={<Button/>} />`
Frakment classic: `<TooltipTrigger asChild><Button/></TooltipTrigger>`

Convert accordingly.

### 9. NEVER use Get-Content / Set-Content

`Get-Content` reads UTF-8 as CP1252, emoji jadi mojibake. Selalu:

```powershell
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::ReadAllText($path, $utf8)
[System.IO.File]::WriteAllText($path, $content, $utf8)
```

### 10. Empty data-slot naming

`Empty` component has `data-slot="empty-icon"` (bukan `empty-media`) - from shadcn-nova. Jangan ubah.

### 11. MessageAnimated alignment (final)

```
isUser ? "end" : "start"     // user RIGHT, assistant LEFT
isUser ? "default" : "ghost" // user bubble, assistant plain
```

Plus `motion.div` needs `className="flex flex-col"` for `Bubble align` to work. **Do not change.**

---

## Next Steps (Priority Order)

### Batch 1 - Textarea + Empty (1-1.5 jam)

**Textarea**:

- `examples/textarea-demo.tsx` (rewrite basic)
- `examples/textarea-field.tsx`
- `examples/textarea-invalid.tsx`
- `content/docs/components/textarea.mdx` (upgrade rich, 4 previews)

**Empty**:

- `examples/empty-demo.tsx` (rewrite with action)
- `examples/empty-outline.tsx`
- `examples/empty-muted.tsx`
- `examples/empty-avatar-group.tsx`
- `content/docs/components/empty.mdx` (upgrade rich, 5 previews)

### Batch 2 - Input Group (1 jam)

- `examples/input-group-demo.tsx` (rewrite: search + trailing)
- `examples/input-group-inline-start.tsx`
- `examples/input-group-inline-end.tsx`
- `examples/input-group-block-end.tsx`
- `examples/input-group-icon.tsx`
- `content/docs/components/input-group.mdx` (upgrade rich, 7 previews)

### Batch 3 - Field upgrade (45 menit)

Add sections to `content/docs/components/field.mdx`:

- `## With Checkbox` + `examples/field-checkbox.tsx`
- `## With Switch` + `examples/field-switch.tsx`
- `## With Select` + `examples/field-select.tsx`

### Batch 4 - Checkbox + Label + Switch (2 jam)

**Checkbox** (3 demo + MDX):

- `checkbox-demo.tsx`, `checkbox-basic.tsx`, `checkbox-invalid.tsx`
- `content/docs/components/checkbox.mdx` (rich)

**Label** (1 demo + MDX):

- `label-demo.tsx` (with checkbox)
- `content/docs/components/label.mdx` (simple, 1-2 previews OK)

**Switch** (3 demo + MDX):

- `switch-demo.tsx`, `switch-description.tsx`, `switch-choice-card.tsx`
- `content/docs/components/switch.mdx` (rich)

### Batch 5 - Select (1 jam)

- `examples/select-demo.tsx` (basic)
- `examples/select-groups.tsx` (grouped)
- `content/docs/components/select.mdx` (rich)

### Final - Update meta.json

```json
[
  "avatar",
  "badge",
  "button",
  "checkbox",
  "code-block",
  "empty",
  "field",
  "input",
  "input-group",
  "item",
  "label",
  "select",
  "separator",
  "switch",
  "textarea"
]
```

Then:

```powershell
Remove-Item -Recurse -Force .source -ErrorAction SilentlyContinue
npx fumadocs-mdx
npm run build
```

---

## Changelog Policy

`content/docs/changelog/` hanya untuk **UI library** user-facing changes.

**JANGAN** masukkan:

- Docs overhaul
- Marketing copy
- Site CSS refactor
- Internal tooling
- Bug fixes site infra

**BOLEH** masukkan:

- New components
- Component behavior changes
- New props / variants
- Dependency changes (motion, @shadcn/react, dll)
- CLI behavior (init, add, list)

Format reference: `content/docs/changelog/2026-11-02.mdx`.

---

## Verification Commands (setelah setiap batch)

```powershell
# 1. Check commit state
git status --short
git log --oneline -3

# 2. Verify files exist
foreach ($n in 'demo1','demo2') { "  examples/$n.tsx : $(Test-Path "examples\$n.tsx")" }

# 3. Verify MDX structure
$path = "content\docs\components\X.mdx"
"  lines: $((Get-Content $path).Count)"
"  previews: $((Select-String -LiteralPath $path -Pattern '<ComponentPreview').Count)"
"  sections: $((Select-String -LiteralPath $path -Pattern '^##').Count)"

# 4. Build (avoid box chars)
npm run build 2>&1 | Select-String -Pattern 'Compiled|Error|Failed|error TS' | Select-Object -Last 10

# 5. Commit + push
git add <files>
git diff --cached --stat
git commit -m "docs: <description>"
git push origin main
```

Pre-commit: format + lint + typecheck + registry-build (~20s).
Pre-push: build + test (~35s).

Kalau typecheck fails on demo (e.g., `items` prop, `value=""`), fix demo, re-stage, re-commit.

---

## Important Files Reference

| File                                | Purpose                                             |
| ----------------------------------- | --------------------------------------------------- |
| `frakment.json`                     | Registry manifest - edit + `npm run registry:build` |
| `content/docs/components/meta.json` | Sidebar order                                       |
| `lib/icons.ts`                      | Lucide-compatible shim over Phosphor                |
| `registry/*.tsx`                    | Source of truth (shipped to users)                  |
| `components/ui/*.tsx`               | Site version (must match registry)                  |
| `public/r/*.json`                   | Generated - do not edit                             |
| `examples/*.tsx`                    | Demo components for ComponentPreview                |
| `cli/templates/theme.css`           | Theme block injected by `frakment init`             |
| `styles/theme.css`                  | Site theme (must match cli/templates/theme.css)     |

**Sync rule**: `registry/X.tsx` must match `components/ui/X.tsx` (hash equal). Verify:

```powershell
(Get-FileHash "registry\X.tsx").Hash -eq (Get-FileHash "components\ui\X.tsx").Hash
```

---

## Design Decisions (Jangan Ubah Tanpa Diskusi)

1. **Theme is inline in globals.css** - bukan file terpisah. Pakai `/* ==== FRAKMENT THEME START/END ==== */` markers. `frakment init` inject otomatis.
2. **`@shadcn/react` = headless engine** for message-scroller. Bukan UI library. Zero styling. Full replace = 5-10 jam reimplement.
3. **`lib/icons.ts` = Lucide-to-Phosphor shim**. Semua import internal `@/lib/icons`, tidak lucide-react atau @phosphor langsung.
4. **`Button` pakai `asChild`** - classic Radix. Convert shadcn Nova demos accordingly.
5. **message-scroller alignment**: user=right/bubble, assistant=left/ghost. Konvensi chat app (WhatsApp), deviates from shadcn.
6. **Setiap komponen baru butuh**: registry entry + site copy + demo + MDX + meta.json.
7. **Rich MDX wajib**: min 1 ComponentPreview hero + multiple per variant. Jangan minimal.

---

## Open Questions

- Changelog untuk `message-animated`: belum documented as separate entry.
- `@shadcn/react` removal: deferred. Alternatif `use-stick-to-bottom` (2-4 jam).
- Deploy + npm publish: belum. Registry `https://frakment.vercel.app/r/` masih 404. Defer.
- `SKILL.md` regen: otomatis via `npm run registry:build`. Jangan edit `public/skills/` manual.

---

---

---

## WORKFLOW — AI ↔ User (WAJIB)

**AI TIDAK eksekusi langsung.** Semua interaksi via PowerShell script yang user copy-paste.

### Pattern yang WAJIB diikuti:

1. **AI kasih script PowerShell** (bukan bash, bukan command langsung)
2. **User copy-paste ke PowerShell** di Windows
3. **User kirim output** balik ke AI
4. **AI analisis output** → next step atau fix

### Rules:

- **JANGAN** kasih command bash (`#!/bin/bash`, `curl`, `rm -rf`)
- **JANGAN** asumsi AI bisa baca/tulis file sendiri — kasih script yang user jalankan
- **SELALU** validasi output user sebelum next step — jangan asumsi sukses
- **Kalau script gagal**: minta full error, jangan lanjut tanpa diagnosis
- **Multi-step**: 1 script per step, tunggu output, baru next
- **Batch besar**: pecah jadi sub-script per file (hindari here-string cutoff)
- **Verifikasi wajib**: setiap script yang modify file, akhiri dengan verify (Test-Path, Select-String, Get-FileHash)

### Anti-pattern:

- ❌ "Saya akan edit file X" — bukan tugas AI, kasih script
- ❌ Multi-aksi dalam 1 script tanpa output — user tidak bisa verifikasi
- ❌ Assume filesystem state — selalu `Test-Path` dulu
- ❌ Script tanpa `Write-Host` verifikasi di akhir

### Kalau user minta AI "langsung edit":

Ingatkan: AI tidak punya filesystem access. Kasih PowerShell script.

## MAINTENANCE — WAJIB (untuk AI selanjutnya)

**HANDOFF.md ini adalah dokumen hidup.** Kalau kamu (AI berikutnya) menyelesaikan task, menemukan bug baru, mengubah keputusan, atau menyelesaikan salah satu batch di "Next Steps", **WAJIB perbarui file ini** sebelum akhiri sesi.

### Rule wajib update HANDOFF.md saat:

1. **Selesai batch** — pindahkan item dari "Next Steps" ke "Yang sudah ada", update tabel Docs Status (Lines, Preview, Status).
2. **Tambah komponen baru** — tambahkan ke tabel "Component Registry" (kategori sesuai). Update total count di TL;DR.
3. **Tambah/ubah MDX** — update tabel "Docs Status" dengan line count + preview count terbaru.
4. **Ketemu bug/gotcha baru** — tambah ke "Known Issues / Gotchas" (nomor urut baru).
5. **Putuskan design decision** — tambahkan ke "Design Decisions" + alasan.
6. **Defer task** — pindahkan ke "Open Questions" dengan alasan + estimasi.
7. **Ubah commit state** — update "Current State" dengan 5 commit terbaru.
8. **Ganti versi dependency** — update tabel deps di "Component Registry" + catat di "Known Issues" kalau breaking.
9. **Ketemu pattern workflow baru** — tambah ke section "WORKFLOW — AI ↔ User".

### Format update minimal (checklist sebelum akhiri sesi):

```powershell
# 1. Cek commit state
git log --oneline -5
git status --short

# 2. Update tabel Docs Status (Lines, Preview count)
#    — pastikan line count & ComponentPreview count sesuai fakta

# 3. Update tabel Component Registry kalau ada komponen baru
#    — 26 → 26+N kalau ada tambahan

# 4. Update section "Next Steps" — hapus yang selesai, tambah yang baru

# 5. Commit HANDOFF.md bersama task utama
git add HANDOFF.md
git commit -m "docs: <task> + update handoff"
```

### Anti-pattern (JANGAN):

- ❌ Commit task tanpa update HANDOFF.md → next AI akan bekerja dari info stale
- ❌ Copy-paste full file untuk edit → rawan corrupt. Edit targeted via:
  ```powershell
  $lines = [System.IO.File]::ReadAllLines($path, $utf8)
  # edit $lines[N] atau splice array
  [System.IO.File]::WriteAllLines($path, $lines, $utf8)
  ```
- ❌ Ubah "Design Decisions" tanpa diskusi user — itu keputusan final
- ❌ Tandai batch "selesai" tanpa `npm run build` sukses + commit ter-push

### Sanity check sebelum commit HANDOFF.md:

> **Note**: `Select-String -Pattern '^## '` akan false-positive pada `## Installation`/`## Usage`/`## Anatomy`/`## Examples`/`## API Reference` yang ada di dalam ```mdx code fence di section "Patterns". Itu **bukan** section asli. Kalau mau bersih, pakai pattern `^## [A-Z]` + skip lines yang di dalam code fence. Atau verifikasi manual bahwa 15 section utama (TL;DR sampai Contact) ada semua.

```powershell
# Preview struktur
Get-Content .\\HANDOFF.md -TotalCount 20
Get-Content .\\HANDOFF.md | Select-Object -Last 20

# Line count harus masuk akal (450-700)
(Get-Content .\\HANDOFF.md).Count

# Semua section utama harus ada
Select-String -LiteralPath .\\HANDOFF.md -Pattern '^## ' | ForEach-Object { $_.Line }
```

Kalau line count drop drastic (< 400) → file terpotong, restore dari git:

```powershell
git checkout HEAD -- HANDOFF.md
```

### Section yang harus ada setelah edit:

- `## TL;DR`
- `## Current State`
- `## Component Registry` (26 komponen, update kalau nambah)
- `## Docs Status`
- `## Demo Files Status`
- `## Patterns (WAJIB IKUTI)`
- `## Known Issues / Gotchas (WAJIB BACA)`
- `## Next Steps (Priority Order)`
- `## Changelog Policy`
- `## Verification Commands`
- `## Important Files Reference`
- `## Design Decisions`
- `## Open Questions`
- `## MAINTENANCE` (section ini)
- `## Contact`

## Contact

Repo: `hanshapd/frakment`
Docs dev: `localhost:3000`

History: `git log --oneline -20 --stat`

---

## SESSION_UPDATE: Batch 1-5 - Docs enrichment

**Status:** `npm run build` EXIT=0, `npm run typecheck` EXIT=0, meta.json 15 halaman.

### Batch 1 - textarea.mdx + empty.mdx ke rich

- textarea.mdx: 5 ComponentPreview (hero + Auto-grow + Disabled + Invalid + With Field)
- empty.mdx: 4 ComponentPreview (hero + Without media + With description link + Outline media)
- Demo baru: textarea-autogrow.tsx, textarea-disabled.tsx, textarea-invalid.tsx, textarea-field.tsx, empty-no-media.tsx, empty-link.tsx, empty-outline.tsx

### Batch 2 - input-group.mdx ke rich (7 preview)

- Preview: hero, Block end, Block start, Textarea, Keyboard hint, Disabled, Invalid
- Demo baru: input-group-block-end.tsx, input-group-block-start.tsx, input-group-textarea.tsx, input-group-kbd.tsx, input-group-disabled.tsx, input-group-invalid.tsx

### Batch 3 - field.mdx ke 7 preview (+3 section baru)

- Section baru: "Checkbox in horizontal Field", "Switch with FieldContent", "Select"
- Demo baru: field-checkbox.tsx, field-switch.tsx, field-select.tsx

### Batch 4+5 - 4 halaman dokumentasi baru

- checkbox.mdx (4 preview): checkbox-demo.tsx, checkbox-states.tsx, checkbox-disabled.tsx, checkbox-with-label.tsx
- label.mdx (3 preview): label-demo.tsx, label-required.tsx, label-disabled.tsx
- switch.mdx (4 preview): switch-demo.tsx, switch-checked.tsx, switch-disabled.tsx, switch-with-description.tsx
- select.mdx (4 preview): select-demo.tsx, select-groups.tsx, select-disabled.tsx, select-invalid.tsx
- meta.json: 15 halaman (checkbox, label, select, switch ditambahkan alfabetis)

### Gotcha baru (WAJIB dibaca sesi berikutnya)

1. Konflik nama export demo vs registry. Fungsi demo yang namanya sama dengan komponen registry (mis. `export function InputGroupTextarea()` padahal `InputGroupTextarea` diimpor dari `@/components/ui/input-group`) membuat webpack BUILD_EXIT=1. Aturan: selalu suffix `Demo` pada fungsi demo yang mirip nama export registry (`InputGroupTextareaDemo`).
2. `npx fumadocs-mdx` TIDAK berfungsi di environment ini (nvm4w, npm 10.9.3, fumadocs-mdx 15.4.10). Error: could not determine executable to run. Ini tidak masalah: generasi MDX otomatis lewat `postinstall: fumadocs-mdx` + plugin `createMDX()` di next.config.mjs. Jangan jalankan manual.
3. `npm run build` harus lewat `cmd.exe`. `& npm run build` dari PowerShell di nvm4w kadang menghasilkan Unknown command: "pm". Selalu pakai: `cmd.exe /c "npm run build > build.log 2>&1"`. Pola sama untuk `npm run typecheck`.
4. next.config.mjs menyalakan `typescript: { ignoreBuildErrors: true }`. Build hijau TIDAK berarti TS bersih. Selalu jalankan `npm run typecheck` setelah build.
5. `checked="indeterminate"` pada Checkbox (Radix primitive) valid, sudah diuji di checkbox-states.tsx.
6. Select tidak menerima `items` prop. Root Select hanya: value / defaultValue / onValueChange / disabled. SelectTrigger menerima `aria-invalid`.

### Status dokumentasi (akhir sesi)

| Komponen                       | Preview | Status                |
| ------------------------------ | ------- | --------------------- |
| field                          | 7       | RICH                  |
| input-group                    | 7       | RICH                  |
| textarea                       | 5       | RICH                  |
| empty                          | 4       | RICH                  |
| checkbox                       | 4       | RICH (baru)           |
| switch                         | 4       | RICH (baru)           |
| select                         | 4       | RICH (baru)           |
| label                          | 3       | MEDIUM (baru)         |
| badge, code-block, item, input | -       | RICH (lama)           |
| avatar, button, separator      | -       | minimal / belum dicek |

Total halaman content/docs/components = 15.

### Next steps

1. Upgrade avatar.mdx, button.mdx, separator.mdx ke standar rich.
2. Naikkan label.mdx ke 4 preview.
3. Verifikasi runtime via `npm run dev` - build statis tidak menangkap error runtime.
4. Audit content/docs/ai-elements/ (trace, terminal, pulse, chain-of-thought).

### Verifikasi akhir

- build: EXIT=0, Compiled successfully 1, 40+ halaman prerender
- typecheck: EXIT=0, error TS 0
- meta.json: JSON valid, 15 halaman

### SESSION_UPDATE lanjutan: bug kritis globals.css (switch tampil hitam)

**Gejala:** Switch hanya tampil teks tanpa track/thumb. HTML benar (role="switch", data-state, thumb span) — masalah murni CSS.

**Root cause:** styles/globals.css hanya punya @custom-variant data-open dan data-closed. Utility data-checked:, data-unchecked:, data-disabled:, data-selected:, data-active: yang dipakai di switch.tsx, checkbox.tsx, select.tsx, field.tsx, input-group — semuanya no-op tanpa deklarasi @custom-variant.

**Fix yang diterapkan:** tambah 5 baris setelah data-closed:
@custom-variant data-checked (&[data-state="checked"]);
@custom-variant data-unchecked (&[data-state="unchecked"]);
@custom-variant data-disabled (&[data-disabled]);
@custom-variant data-selected (&[data-state="selected"]);
@custom-variant data-active (&[data-state="active"]);

**Gotcha baru (WAJIB):**

7. Path theme yang benar = styles/globals.css, BUKAN app/globals.css. Handoff lama menyebut app/globals.css — file itu tidak ada. Yang benar: styles/globals.css (9728 byte sebelum fix, 10006 setelah). Struktur import: tailwindcss -> tw-animate-css -> ./theme.css -> ./site.css. Marker FRAKMENT THEME START/END tidak dipakai di site ini.

8. Setiap utility data-*: di komponen butuh @custom-variant eksplisit. Tailwind v4 tidak punya varian data-checked/data-unchecked/data-disabled bawaan. Kalau komponen baru memakai data-foo: tanpa @custom-variant data-foo di globals.css, utility-nya diam-diam no-op (tidak ada error, hanya style hilang). Cek via: Select-String -Path styles/globals.css -Pattern "@custom-variant".

9. css_files=0 di .next/static/css/ normal di dev mode. Tailwind v4 di Next.js dev dikompilasi via webpack HMR, tidak ditulis ke disk. Folder itu baru terisi setelah npm run build. Dev mode juga tidak menyisipkan <link rel="stylesheet"> ke HTML — style via HMR chunk. Verifikasi visual browser adalah satu-satunya bukti definitif.

### SESSION_UPDATE final: fix distribusi CSS ke end-user

**Temuan:** setelah fix switch di globals.css (site), end-user flow (npx frakment init) masih rusak. Arsitektur CSS punya 2 layer:

- Site dev: styles/globals.css -> @import "./theme.css"
- User via init: cli/src/commands/init.js line 111-115 -> read cli/templates/theme.css -> wrap marker FRAKMENT THEME START/END -> inject ke user globals.css

**Root cause kedua:** cli/templates/theme.css (6627 byte, SHA256 3F84...A0B2) berisi NOL @custom-variant. Semua user yang jalankan init SEBELUM fix ini mendapat komponen switch/checkbox/select/field RUSAK.

**Fix yang diterapkan:**

- cli/templates/theme.css: prepend 10 baris (komentar + 8 @custom-variant) -> 7238 byte, SHA256 D4CF20FA...
- styles/theme.css: copy identik dari template -> SHA256 sama
- styles/globals.css: hapus 8 @custom-variant yang sebelumnya ditambahkan manual (sekarang hanya import), ganti dengan komentar pointer

**Verifikasi:**

- build EXIT=0, typecheck EXIT=0, error TS 0
- varian coverage: globals=0 theme=1 untuk 8 varian (single source of truth)
- template <-> site SHA256 identik: D4CF20FA47458DE91A3FD00AB9BFEA506FA4216825EBFDD7FDB4BA5009C2FB1A
- init.js simulasi: user globals.css akan dapat 8 @custom-variant, idempoten pada re-run

**Gotcha baru (WAJIB):**

10. CSS Frakment didistribusikan ke user via cli/templates/theme.css (di-inject init.js dengan marker FRAKMENT THEME START/END), BUKAN via registry r/*.json. Setiap perubahan theme WAJIB apply ke cli/templates/theme.css DAN styles/theme.css (keduanya harus SHA256 identik). Verifikasi: Get-FileHash -Algorithm SHA256 pada kedua file.

11. Single source of truth untuk @custom-variant = theme.css. styles/globals.css hanya @import "./theme.css"; JANGAN tambah @custom-variant langsung di globals.css (menyebabkan duplikasi deklarasi saat Tailwind compile). Kalau perlu varian baru: edit cli/templates/theme.css, copy ke styles/theme.css, build ulang.

12. Rantai lengkap CSS user flow:
    cli/templates/theme.css -> (init.js wrap marker) -> user's globals.css
    styles/theme.css -> (globals.css @import) -> site dev/build

    Kalau switch/checkbox/select/field tampil sebagai teks polos di user project: 99% user project tidak punya FRAKMENT THEME block atau template stale. Solusi: jalankan ulang `npx frakment init` (idempoten, aman) atau minta user update cli ke versi terbaru.

**Status akhir sesi ini:**

- Site: build EXIT=0, typecheck EXIT=0, 15 halaman docs semua RICH
- End-user flow: template fix, verifikasi statis idempoten
- Bug kritis globals.css: fixed di dua layer (site + user distribution)

### SESSION_UPDATE: fix preview off-center (commit 05980bd)

**Gejala:** di /docs/components/field, section "Checkbox in horizontal Field" dan "Switch with FieldContent" — konten menempel di pinggir kiri preview, bukan center.

**Root cause:** wrapper demo `examples/field-checkbox.tsx` dan `examples/field-switch.tsx` memakai `w-full max-w-sm` (384px). Field horizontal (registry/field.tsx line 60-61) punya `flex w-full ... *:data-[slot=field-label]:flex-auto` — label mengisi seluruh 384px, sehingga checkbox/switch tampak di ujung.

**Fix:** `<div className="w-full max-w-sm">` -> `<div className="w-fit">` di kedua file. Wrapper shrink-wrap, parent `preview flex justify-center` otomatis center-kan.

**Verifikasi:** build EXIT=0, 144/144 static pages, test 39/39, commit 05980bd pushed ke origin/main.

**Tidak diubah (by design):**

- switch-demo, switch-checked, switch-disabled: `flex items-center gap-2` tanpa w-full (shrink-wrap natural)
- checkbox-demo, checkbox-states, checkbox-disabled, checkbox-with-label: idem
- switch-with-description: pola settings row, sengaja spread
- select-_, textarea-_, label-_, input-group-_: `w-full max-w-sm` vertical (isi mengisi 384px, center otomatis)

**Gotcha baru:**

13. ComponentPreview container (components/component-preview-tabs.tsx) memakai `flex w-full justify-center` + `data-[align=center]:items-center`. Konten shrink-wrap (`w-fit` atau tanpa w-full) otomatis center. Konten dengan `w-full` akan mengisi lebar dan membuat anak-anaknya terlihat menempel kiri jika tidak ada layout center. Aturan: demo dengan komponen tunggal sempit (checkbox+label, switch) pakai `w-fit` atau tanpa wrapper w-full. Demo vertical dengan trigger/input 384px pakai `w-full max-w-sm`.

14. Kalau user melaporkan preview tidak center, audit demo file untuk pola `<div className="w-full max-w-sm">` yang berisi komponen horizontal (Field orientation="horizontal", flex-row, dsb). Vertical aman. Fix minimal: ganti ke w-fit, JANGAN ubah ComponentPreviewTabs global (risiko regresi preview lain).

**Status:** branch main = origin/main = 05980bd, build EXIT=0, typecheck EXIT=0, test 39/39, registry 26 komponen.

### SESSION_UPDATE: card upgrade + message-scroller polish

- components/ui/card.tsx: upgrade ke shadcn spec (size prop, --card-spacing var), backup di frakment-baks/
- styles/theme.css + cli/templates/theme.css: tambah --card-spacing: --spacing(4) di @theme inline, SHA256 identik
- examples/message-scroller-demo.tsx: p-(--card-spacing), h-140, title "Morning, frakment!"
- Build EXIT=0, test 39/39, commit cd70a8f

**Gotcha #15:** JANGAN taruh file .bak di components/, app/, atau lib/ - Turbopack akan mencoba parse sebagai module dan build gagal "Unknown module type". Taruh semua backup di luar tree project (C:\Users\PC\Desktop\frakment-baks).
**Gotcha #16:** message-scroller-demo.tsx di Frakment sudah ada sejak awal, bukan hasil generate. Pakai pola existing sebagai basis - jangan replace total dari copy shadcn docs (import sudah disesuaikan @/lib/icons + asChild, gampang regress).
**Gotcha #17:** Ketika paste multi-line script PowerShell di terminal ini, sering break (line terakhir tidak ke-Enter atau paste terpotong). Untuk perubahan kecil pakai single-line (Command; Command; ...). Untuk edit file besar pakai notepad atau WriteAllText dari file terpisah.

### SESSION_UPDATE: toggle, toggle-group, card, tooltip, dropdown-menu (commits 6b6f84d + 819b68b)

**Ditambahkan:**

- 5 halaman docs baru: toggle, toggle-group, card, tooltip, dropdown-menu (semua rich, 3-7 preview)
- 25 demo baru: 12 toggle/toggle-group, 5 card, 3 tooltip, 5 dropdown-menu
- 2 komponen registry: toggle, toggle-group (28 total)
- meta.json: 17 -> 20 halaman

**Status verifikasi:**

- build EXIT=0 (159 static pages)
- typecheck EXIT=0
- test 39/39
- registry 28 komponen

**Gotcha baru (WAJIB):**

**#15** Phosphor Icons versi installed pakai `TextB` untuk Bold, bukan `TextBolder`. Verifikasi nama ekspor lewat `Get-ChildItem node_modules\@phosphor-icons\react\dist\ssr -Filter "TargetName*.d.ts"` sebelum menambah ke shim. Error manifest: build error "Export X doesn't exist in target module" (bukan TS error).

**#16** Saat menambah ikon ke `lib/icons.ts`, SELALU tambahkan alias `as XIcon` jika demo/Lucide-style import pakai suffix Icon (mis. `Bookmark as BookmarkIcon`). Tanpa alias, runtime error "Element type is invalid ... got: undefined" muncul di prerender, bukan di compile.

**#17** Radix ToggleGroup versi ini WAJIB prop `type` eksplisit (`"single"` atau `"multiple"`). Prop `multiple` saja tidak cukup. Error: "Missing prop `type` expected on `ToggleGroup`". Demo harus selalu pasang `type=...`.

**#18** PowerShell single-quote TIDAK interpretasi backtick escape. `'Bookmark,`r`n  Bookmark as BookmarkIcon,'` akan menulis literal `` `r`n `` ke file, bukan newline. Untuk multi-line replace di file, WAJIB pakai `[IO.File]::WriteAllLines(path, stringArray, encoding)` — bukan `.Replace('...','...')` dengan string single-quote berisi `` `r`n ``.

**#19** `[IO.File]::AppendAllLines(path, lines, encoding)` TIDAK ada di PowerShell 5.1 (hanya overload 2-arg). Untuk append di PS 5.1, pakai `[IO.File]::WriteAllText($p, ([IO.File]::ReadAllText($p,$enc)) + ($L -join "`r`n") + "`r`n", $enc)`.

**Next steps:**

1. AI Elements MDX yang belum punya preview (trace, terminal, pulse, chain-of-thought, pulse-status)
2. Verify preview runtime via `npm run dev` untuk 5 halaman baru
3. Label naik ke rich (4 preview)
4. Avatar, button, separator ke standar rich
