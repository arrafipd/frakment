↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Session — Component Additions (card, toggle, tooltip, dropdown)

Added card, tooltip, dropdown-menu docs + demos. Added toggle/toggle-group to registry.

---

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
