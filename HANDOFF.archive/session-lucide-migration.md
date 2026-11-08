↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Session — Lucide → Phosphor Migration

> [!WARNING]
> **STATUS: REVERTED.** This session migrated `lucide-react` to `@phosphor-icons/react`. The migration was later reversed — see `HANDOFF.md` gotcha #54. **Current state:** registry components use `lucide-react` directly; `@phosphor-icons/react` is site-only (`lib/icons.ts`, `components/icons.tsx`). Do not follow this pattern for new components. Historical reference only.

Complete migration from lucide-react to @phosphor-icons/react. Renamed LucideIcon to IconComponent. Registered icons shim.

---

### SESSION_UPDATE: full lucide-react → @phosphor-icons/react migration

**Motivasi:** Zero lucide-react di source code; konsisten pakai shim `lib/icons.ts` (Phosphor).

**Yang dimigrasi (source):**

- 8 demo + 7 registry + mdx-components.tsx: `from "lucide-react"` → `from "@/lib/icons"`
- 17 MDX docs: import + npm install snippet → `@phosphor-icons/react`
- 19 ikon baru ditambah ke shim: Robot, Code, Files, FileText, List, TreeStructure, ChatCentered, Sparkle, Clock, FileCode, Gauge, GitBranch, GitPullRequest, Network, Package, Rocket, Trash, Paragraph
- Type `LucideIcon` → `IconComponent` (breaking, tapi internal only)
- cli/init.js dep list: `lucide-react` → `@phosphor-icons/react`

**Registry changes:**

- Komponen baru: `icons` (source `registry/icons.tsx`, target `lib/icons.ts`, deps `@phosphor-icons/react`)
- 10 komponen yang pakai shim: `chain-of-thought`, `checkbox`, `code-block`, `message-scroller`, `pulse-status`, `pulse`, `select`, `spinner`, `terminal`, `trace`
- Semua entry: deps `@phosphor-icons/react` + regdeps `icons`

**Hasil:**

- `REG_EXIT=0`, 29 komponen
- `BUILD_EXIT=0`, 159 static pages
- ZERO lucide-react di source (kecuali HANDOFF + package-lock transitive)

**Gotcha baru:**

**#20** `package-lock.json` masih punya `lucide-react` — transitive dari fumadocs-core (peerOptional) dan fumadocs-ui (peer). TIDAK BISA dihapus tanpa drop fumadocs. Ini normal dan tidak mempengaruhi runtime/bundle site. Cek: `npm why lucide-react`.

**#21** Registry icons component pattern: shim `lib/icons.ts` sekarang jadi entry di frakment.json dengan `source: registry/icons.tsx`, `target: lib/icons.ts`, deps `@phosphor-icons/react`. Setiap komponen yang import `@/lib/icons` WAJIB punya regdep `icons` di frakment.json, kalau tidak user akan dapat error `Cannot find module @/lib/icons` saat install.

**#22** Saat menambah ikon baru ke shim: verifikasi nama ekspor Phosphor via `Get-ChildItem node_modules\@phosphor-icons\react\dist\ssr -Filter "TargetName*.d.ts"`. Nama tidak selalu match Lucide (`Clock` = Clock, bukan ClockIcon; `TextBolder` = `TextB`; `WrapText` = `Paragraph`). Alias `Name as XIcon` wajib untuk Lucide-style import.

**#23** Build-registry.mjs `detectImports` pakai regex `/from\s+["\x27]([^"\x27]+)["\x27]/g` — catch SEMUA `from "X"` termasuk di KOMENTAR. Kalau source punya contoh code di komentar seperti `// import { X } from "old-library"`, itu akan jadi deps phantom di JSON output. Solusi: hindari pattern `from "literal"` di komentar, atau rewrite komentar.
