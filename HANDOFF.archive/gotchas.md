↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Gotchas — Full Detail

Every gotcha from all sessions, chronologically. `HANDOFF.md` keeps the active ones as terse one-liners; this file keeps full context for grep.

## Table of contents

- [Gotchas #1–11 (early sessions)](#gotchas-111-early-sessions)
- [Gotcha #18 — PowerShell quoting](#detail-gotcha-18)
- [Gotcha #24 — Lefthook](#detail-gotcha-24)

---

## Gotchas #1–11 (early sessions)

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

---

### Detail gotcha #24 (lefthook)

- **#24:** pre-commit otomatis jalankan format (oxfmt) + lint (ultracite) + typecheck + registry:build. Pre-push jalankan build + test. Kalau commit/push gagal karena hook: **baca error, fix, commit/push ulang**. JANGAN `--no-verify` (kecuali sangat darurat, dan tetap jalankan manual `npm run check` + `npm run build` dulu).

### Detail gotcha #18 (PowerShell quoting)

- **#18:** single-quote tidak interpret backtick. Untuk newline/multi-line selalu pakai array literal + `[IO.File]::WriteAllLines` atau `-join [Environment]::NewLine`. Jangan `.Replace('...','...`r`n...')`.

---

## Gotchas #34–#45 (2026-11-07 session)

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

### #57 — `has-disabled:opacity-50` on a parent group fades every child

Putting `has-disabled:opacity-50` on a wrapper with a disabled child cascades
50% opacity to text, icons, borders, and background. The composition looks
broken even when tokens are correct. Fix: remove it from the wrapper and use
`disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100` on the
disabled control itself. Applied to `input-group`, `input-otp`,
`native-select`.

### #58 — Colors in base cva override variant colors

Adding a color class like `text-foreground` to a `cva()` base string
overrides `text-primary-foreground` from `variant="default"`. Result: white
text on a light primary background, invisible in dark mode. Base cva must
stay color-neutral; variants own the color.

### #59 — Tailwind v4 body needs explicit bg-background

`<body>` with only `text-foreground` leaves the canvas transparent. In dark
mode the browser renders white, making light foreground text invisible.
Always include `bg-background` on `<body>` (or via
`@layer base { body { @apply bg-background text-foreground } }`).

- #60: PowerShell 5.1 here-string / paste >2KB kepotong di tengah (bukan hanya heredoc interaktif). Gejala: prompt PS stuck di prompt kontinuasi setelah baris awal. Workaround: StreamWriter + WriteLine per baris, atau [IO.File]::WriteAllText dengan chunk <2KB + UTF8Encoding($false). Hindari here-string untuk MDX/CSS besar.
- #61: `ComponentSource name="X"` di docs resolve via `getDemoSource(name)` (`examples/X.tsx`) atau `getRegistrySource(name)` (`registry/X.tsx` / `.ts`). `title` adalah label display, BUKAN path resolver. Untuk lib engine (`lib/ai.ts`), composition di `components/ui/` (`chain-of-thought`, `terminal`), atau parked component (`markdown`, `kbd`) -> wajib `src="path/lengkap"`. Gejala kalau salah: tag render kosong tanpa error, karena resolver return null dan ComponentSource `return null`. Audit cepat: grep `<ComponentSource name=` -> cross-check ke `examples/X.tsx` / `registry/X.tsx`.