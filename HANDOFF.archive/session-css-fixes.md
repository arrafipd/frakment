↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Session — CSS Fixes (globals.css, distribution, preview)

Fixed @custom-variant missing in theme.css (switch display bug), synced site + CLI templates, fixed preview off-center (w-fit).

---

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
