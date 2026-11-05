# Archived history

Sections moved here on 2026-11-05 to keep HANDOFF.md under 15KB. Content preserved verbatim.

- Auto-resolving
- Security Posture
- Dependabot / Audit
- GitHub Ruleset Setup
- Recent Commits
- Status Lint
- Backlog Publish
- Catatan dependency
- Internal: BOM handling (CLI)
- React Engine (@frakment/react/message-scroller)

---
## Dependabot / Audit

Status: **1 alert tersisa (low), tidak ada fix**.

### esbuild (fixed)

CVE: path traversal di dev server Windows. Sebelumnya `tsup` punya nested `esbuild@0.27.7` (vulnerable). Fix via `overrides.esbuild = "^0.28.1"` di root `package.json` + clean install (`npm install` dengan npm 11, karena npm 10.9 crash `edgesOut` tanpa lockfile).

Sekarang semua `esbuild@0.28.2` (hoisted), tidak ada nested. `npm audit` bersih dari esbuild.

### deepmerge (FIXED via fork override)

CVE: prototype poisoning di `mergeObject()`. `deepmerge@4.3.1` tidak akan di-patch (maintainer menolak). Fix: override ke fork `@stackline/deepmerge@1.1.0` (drop-in replacement, CVE fixed, zero deps).

Override di `package.json`: `"deepmerge": "npm:@stackline/deepmerge@^1.1.0"`.

Diverifikasi: `npm audit` = 0 vulnerabilities, `ultracite` tetap jalan, build+test 39/39.

### Aturan ke depan

- Selama `package-lock.json` ada, **selalu `npm ci`** — bukan `npm install`. `npm ci` <60 detik kalau cache hangat.
- `npm install` hanya kalau mengubah dependency.
- Jangan `npm audit fix --force` tanpa review — sering downgrade major.


## Auto-resolving

- `CITests` — resolves after the first PR is merged (Scorecard scans merged PRs for CI coverage).

### Fixed (was alerting)

- zizmor/unpinned-uses (19) — pinned all `uses:` to full SHA.
- zizmor/artipacked (10) — added `persist-credentials: false` to every `actions/checkout`.
- zizmor/self-repository (5) — `./.github/actions/setup` → `$/.github/actions/setup`.
- zizmor/unpinned-images (1) — semgrep image pinned to `semgrep/semgrep:1.99.0@sha256:...`.


### Dismissed (false positive)

- `PinnedDependenciesID` (6 alerts) — dismissed. `$/.github/actions/setup` is a **local composite action** shipped in this repo. Scorecard flags any `uses:` without `@SHA` as unpinned, but local actions cannot be pinned (no remote tag). This is a Scorecard limitation, not a real issue. Dismissed with reason `won't fix` + comment. Traceable to alerts #73, #87, #88, #89, #90, #91.


## Security Posture

**Open alerts: 0** (zizmor, Scorecard, Secret Scanning, Dependabot, CodeQL). Do not re-open dismissals without reading this section.

### Fixed (was alerting)

| Rule | Count | Fix | Commit |
|---|---|---|---|
| zizmor/unpinned-uses | 19 | every `uses:` pinned to full SHA | `76c0183` |
| zizmor/artipacked | 10 | `persist-credentials: false` on every `actions/checkout` | `76c0183` |
| zizmor/self-repository | 5 | `./.github/actions/setup` → `$/.github/actions/setup` | `76c0183` |
| zizmor/unpinned-images | 1 | `semgrep/semgrep:1.99.0@sha256:...` | `76c0183` |
| Scorecard/PinnedDependencies | 20 | remote actions pinned to SHA | `76c0183` |
| Scorecard/TokenPermissions | 7 | write perms moved to job-level | `87a6ef5` |
| CI: EMISSINGSIGNATUREKEY | 1 | upgraded npm to 11.7.0 in composite setup (keyless attestation fix) | `41738892587` |

### Dismissed — accepted trade-offs

All dismissed with `won't fix` + comment. Re-open only if the stated condition changes.

| Rule | Reason | Re-open when |
|---|---|---|
| CodeReviewID | Solo dev, no required reviewer | A second maintainer joins |
| BranchProtectionID | Admin bypass by design (non-admin path protected) | Repo policy changes to no-bypass |
| MaintainedID | Repo <90 days old | Repo >90 days |
| CITestsID | All changes via direct push (admin bypass) | First PR merges |
| FuzzingID | No fuzzing harness yet | ClusterFuzzLite added |
| CIIBestPracticesID | External OpenSSF badge not registered | bestpractices.dev badge added |
| PinnedDependenciesID (false positive) | `$/.github/actions/setup` is a local composite action — no SHA applies | Never (Scorecard limitation) |

### Re-opening a dismissal

```powershell
gh api 'repos/arrafipd/frakment/code-scanning/alerts?state=dismissed&per_page=100' --jq '.[] | {number, rule: .rule.id}'
gh api -X PATCH 'repos/arrafipd/frakment/code-scanning/alerts/<number>' -f state=open
```

### Rules (do not break)

- Top-level `permissions:` stays minimal (`contents: read`; `pull-requests: write` only in dependency-review).
- Write perms (`security-events: write`, `id-token: write`, `actions: read`) go **job-level** on the job that uploads SARIF. Violating re-triggers TokenPermissions.
- Every `uses:` must be pinned to a full 40-char SHA. Do not use `@vN` tags.
- Every `actions/checkout` must set `persist-credentials: false`.
- Local actions use `$/.github/...`, not `./.github/...`.
- Docker images pinned to `tag@sha256:...`.
- CI runs `npm install -g npm@11.7.0` before `npm ci` — required for `npm audit signatures` with keyless attestations (EMISSINGSIGNATUREKEY fix). Do not remove.


## Recent Commits

`0fc269e` biome public/r · `13b3065` registry format · `485021f` tarball fix · `c87b29b` monorepo · `c806ff6` naming · `f3d1d18` archive split


## Status Lint

Lint **0 errors** (cleanup selesai di `f74f909`, 541 → 0). `npm run check` = `Checked N files. No fixes applied.` (exit 0).


## GitHub Ruleset Setup

Branch `main` dilindungi **3 ruleset** (Settings → Rules → Rulesets). Tidak ada branch protection klasik.

| Ruleset | ID | Rules | Admin | Non-admin |
|---|---|---|---|---|
| `main-pr-bypass` | 26273226 | `pull_request` | bypass `always` | Wajib PR |
| `main-ci-bypass` | 26446591 | `required_status_checks` | bypass `always` | Wajib CI hijau |
| `main-strict` | 26471084 | `non_fast_forward`, `deletion` | bypass `always` | Diblok |

### Admin — full bypass

- Direct push ke `main` ✅
- Force-push `main` ✅
- Delete `main` ✅
- Merge PR saat CI merah ✅
- **Tidak perlu toggle ruleset** untuk cleanup — cukup `git push --force`

### Non-admin — terlindungi penuh

- Direct push ❌ (Ruleset A)
- Merge PR saat CI merah ❌ (Ruleset B)
- Force-push / delete `main` ❌ (Ruleset C)

### Inspeksi

`gh api repos/arrafipd/frakment/rulesets --jq ".[] | {id, name, enforcement}"`
`gh api repos/arrafipd/frakment/rulesets/<id> --jq "{name, bypass: .bypass_actors, rules: [.rules[].type]}"`

Update: tulis body JSON + `gh api -X PUT repos/arrafipd/frakment/rulesets/<id> --input body.json`.


## React Engine (@frakment/react/message-scroller)

Selesai di `2075e37`. Menggantikan `@shadcn/react` — sudah dihapus dari deps.

### Files

- `packages/react/src/message-scroller/` — 10 file: `context.tsx`, `provider.tsx`, `root.tsx`, `viewport.tsx`, `content.tsx`, `item.tsx`, `button.tsx`, `hooks.ts`, `use-merged-ref.ts`, `types.ts`, `index.ts`
- Export: `MessageScroller` (Provider/Root/Viewport/Content/Item/Button) + 3 hook (`useMessageScroller`, `useMessageScrollerScrollable`, `useMessageScrollerVisibility`)

### API surface (contract-first, matching @shadcn/react)

- 13 tipe publik di `types.ts`
- `useMessageScroller()`: `scrollToEnd`, `scrollToStart`, `scrollToMessage`
- `useMessageScrollerScrollable()`: `{ start, end }`
- `useMessageScrollerVisibility()`: `{ currentAnchorId, visibleMessageIds }`

### Migrasi

- `components/ui/message-scroller.tsx:8` — import diganti ke `@frakment/react/message-scroller`
- `registry/message-scroller.tsx:8` — sama
- Root `package.json`: `@shadcn/react` dihapus, `@frakment/react: 0.0.1` ditambah

### Catatan build lokal Windows

Turbopack crash (`0xC0000409` stack overrun) dengan multi-worker. Fix: `cross-env NEXT_WORKER_THREADS=1 next build` di `package.json` scripts. Tidak affect CI Linux.


## Backlog Publish

Semua paket siap publish (build + test hijau, tarball verified):

| Paket | Versi | Ready |
|---|---|---|
| `frakment` | 0.0.1 | ✅ |
| `@frakment/ai` | 0.0.1 | ✅ |
| `@frakment/mcp` | 0.0.1 | ✅ |
| `@frakment/react` | 0.0.1 | ✅ (engine selesai di `2075e37`) |

Langkah: `npm login` → `npm run changeset` (4 paket, `minor`) → `npm run version:packages` → commit → `npm run release`.


## Catatan dependency

Setelah package.json overrides berubah, jalankan 
pm install (bukan 
pm ci) sekali untuk regenerate lockfile. Setelah itu kembali ke 
pm ci untuk install cepat.


## Internal: BOM handling (CLI)

`packages/cli/src/commands/init.js` strips UTF-8 BOM from `globals.css`, `package.json`, and `components.json` before parsing. Handle file yang ditulis PowerShell 5.1 `Set-Content -Encoding utf8` (yang prepend BOM).

**Bukan docs user-facing.** Jika ada laporan "CLI error di Windows", cek BOM dulu.

