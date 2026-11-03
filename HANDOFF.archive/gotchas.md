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
