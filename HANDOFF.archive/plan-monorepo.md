↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Monorepo Conversion + npm Publish Plan

Convert Frakment from polyrepo-lite (3 separate node_modules + 3 lockfiles) to a proper npm workspace monorepo with changesets.

## Naming (final)

| #   | Nama npm          | Type           | Publish        | Bin            |
| --- | ----------------- | -------------- | -------------- | -------------- |
| 1   | `frakment`        | CLI (unscoped) | ✅ public      | `frakment`     |
| 2   | `@frakment/ai`    | AI engine      | ✅ public      | —              |
| 3   | `@frakment/react` | React engine   | ✅ public      | —              |
| 4   | `@frakment/mcp`   | MCP server     | ✅ public      | `frakment-mcp` |
| 5   | `@frakment/site`  | Site Next.js   | ❌ **private** | —              |

Pola: `frakment` brand command (seperti `next`, `vercel`, `tailwindcss`) + `@frakment/*` companions (seperti `@next/*`, `@vercel/*`, `@tailwindcss/*`). Tidak ada package `frakment-` hyphenated.

## Current state (before)

| Package | Path   | Name                   | node_modules | Lockfile |
| ------- | ------ | ---------------------- | ------------ | -------- |
| Site    | `/`    | `frakment` (collision) | 671 MB       | 398 KB   |
| CLI     | `/cli` | `frakment` (collision) | 1.1 MB       | 14 KB    |
| MCP     | `/mcp` | `frakment-mcp`         | 16.6 MB      | 43 KB    |

**Problems:** 3x npm install, 3x lockfile, root+CLI nama sama, no shared tooling, publish manual 30-45 menit.

## Target state

```
C:\Users\PC\Desktop\frakment\
├── package.json          ← @frakment/site (private)
├── .changeset/
├── packages/
│   ├── cli/              ← frakment (unscoped, bin frakment)
│   ├── ai/               ← @frakment/ai
│   ├── react/            ← @frakment/react
│   └── mcp/              ← @frakment/mcp (bin frakment-mcp)
├── lib/ai.ts             ← shim re-export from @frakment/ai
├── node_modules/         ← single hoisted
└── package-lock.json     ← single lockfile
```

Workspaces: `["packages/*"]`. Site files (app/, components/, content/, lib/, dll) tetap di root — bukan workspace.

## Phase 1 — Root package.json + changesets (10 mnt)

1. Rename root `name: "frakment"` → `"@frakment/site"` (hindari collision dengan CLI)
2. Tambah `workspaces: ["packages/*"]`
3. Tambah devDep `@changesets/cli`
4. Scripts: `changeset`, `version:packages`, `release`
5. `.changeset/config.json` — access public, baseBranch main
6. `.changeset/README.md` — workflow doc

## Phase 2 — Move cli + mcp + lib/ai → packages/* (45 mnt)

1. Move `cli/` → `packages/cli/` — name tetap `"frakment"` (unscoped, bin `frakment`)
2. Move `mcp/` → `packages/mcp/` — rename `name: "frakment-mcp"` → `"@frakment/mcp"` (bin tetap `frakment-mcp`)
3. Buat `packages/ai/` folder
4. `packages/ai/package.json` — name `"@frakment/ai"` v0.0.1, exports dist/index.js + dist/index.d.ts, peerDeps `ai: ">=7"`
5. `packages/ai/tsconfig.json` — extends root, outDir dist
6. `packages/ai/tsup.config.ts` — entry src/index.ts, format ESM, dts, clean
7. Copy `lib/ai/*.ts` → `packages/ai/src/*.ts` (10 files)
8. `packages/ai/src/index.ts` — re-export `createChat`, `getMessageText`, semua types
9. Update `lib/ai.ts` → `export { createChat, getMessageText } from "@frakment/ai"; export type { ... } from "@frakment/ai";`
10. Verify 5 importers tetap resolve: `components/message-animated.tsx`, `examples/chain-of-thought-demo.tsx`, `examples/message-scroller-demo.tsx`, `examples/terminal-demo.tsx`, `registry/message-animated.tsx`

## Phase 3 — Skeleton packages/react (15 mnt)

1. Buat `packages/react/` folder
2. `packages/react/package.json` — name `"@frakment/react"` v0.0.1, peerDeps `react: ">=19"`, `react-dom: ">=19"`, exports dist/index.js + dist/index.d.ts
3. `packages/react/tsconfig.json` + `tsup.config.ts` (mirror ai)
4. `packages/react/src/index.ts` — placeholder `export {};` (engine diisi sesi berikutnya)
5. `packages/react/README.md` — roadmap link `/docs/libraries/react`

## Phase 4 — Cleanup + install + verify (30 mnt)

1. Delete `cli/node_modules`, `mcp/node_modules`
2. Delete `cli/package-lock.json`, `mcp/package-lock.json` (single root lockfile)
3. Update `next.config.mjs` — `transpilePackages: ["@frakment/ai", "@frakment/react"]`
4. `npm install` di root (single hoist)
5. `npm run build --workspaces --if-present` — build ai + react packages
6. Verify: `npm run build` (163 pages), `npm run typecheck`, `npm run check`, `npm test` (39/39)
7. Verify CLI: `node packages/cli/src/index.js --version`
8. Verify MCP: `node packages/mcp/index.js --help` (atau equivalent)
9. Commit + push

## Command syntax (breaking change)

CLI tetap `frakment` (unscoped). Hanya MCP + import library yang berubah:

| Sebelum                   | Sesudah                                        |
| ------------------------- | ---------------------------------------------- |
| `npx frakment init`       | `npx frakment init` ✅ **tidak berubah**       |
| `npx frakment add button` | `npx frakment add button` ✅ **tidak berubah** |
| `npx frakment list`       | `npx frakment list` ✅ **tidak berubah**       |
| `npx -y frakment-mcp`     | `npx -y @frakment/mcp`                         |
| (import dari `@/lib/ai`)  | `import { createChat } from "@frakment/ai"`    |

**Doc updates (~17 refs saja — CLI docs tidak perlu diubah):**

- **MCP refs (~17):** `content/docs/mcp/index.mdx`, `mcp/README.md`, `skills/frakment-usage/SKILL.md`, `README.md`, `components/agents-popover.tsx`, `components/home-ctas.tsx`, `constants/site.ts`, `lib/agent-discovery/site-agent-skill.ts`, `mcp/index.js`
- **CLI refs (~116):** ❌ tidak diubah — `npx frakment init` tetap jalan

## Phase 5 — Update MCP docs (~17 refs) (30 mnt)

Bulk find-replace: `npx -y frakment-mcp` → `npx -y @frakment/mcp` + `frakment-mcp` (sebagai package name, bukan bin) → `@frakment/mcp`. Verify build + commit.

## Publish workflow

### Setup one-time

```bash
npm install                              # single root install
npm run build --workspaces --if-present  # build ai + react
```

### Publish cycle

```bash
npm run changeset         # pilih package + bump + summary
npm run version:packages  # bump version + CHANGELOG.md per package
npm run release           # build all + changeset publish + git tag
```

### Publish besok (4 packages)

```bash
npm run changeset       # pilih 4: frakment, @frakment/mcp, @frakment/ai
                        # @frakment/react ditunda (engine belum)
npm run version:packages
npm run release
```

`@frakment/react` di-publish terpisah setelah engine selesai.

## Publish targets

| Package      | Npm name              | Path              | Bin            | Publish besok?  |
| ------------ | --------------------- | ----------------- | -------------- | --------------- |
| CLI          | `frakment` (unscoped) | `packages/cli/`   | `frakment`     | ✅ siap         |
| MCP server   | `@frakment/mcp`       | `packages/mcp/`   | `frakment-mcp` | ✅ siap         |
| AI engine    | `@frakment/ai`        | `packages/ai/`    | —              | ✅ siap         |
| React engine | `@frakment/react`     | `packages/react/` | —              | ❌ engine belum |
| Site         | `@frakment/site`      | `/` (root)        | —              | ❌ private      |

## Rules

- Root `package.json` `name: "@frakment/site"`, `private: true` — tidak pernah publish
- `packages/*` — semua publishable except react (belum siap)
- `frakment` unscoped (brand command); companions `@frakment/*`
- `changesets` handle: version bump, internal dep update (`workspace:*` → `^x.y.z`), CHANGELOG, git tag
- Setiap package punya `README.md` sendiri sebelum publish
- `npm pack` per package sebelum publish (verify tarball content)
- Tidak ada package `frakment-` hyphenated, tidak ada alias

## Risks + mitigations

| Risk                                   | Mitigation                                                          |
| -------------------------------------- | ------------------------------------------------------------------- |
| Root dan CLI sama-sama `frakment`      | Rename root → `@frakment/site` (Phase 1)                            |
| CLI/MCP deps konflik dengan root       | `npm install --workspaces` resolve; kalau error, pin version manual |
| Site break setelah `lib/ai` di-extract | Shim `lib/ai.ts` re-export — 5 importers tidak berubah              |
| `transpilePackages` lupa               | Phase 4 step 3 wajib                                                |
| Build order                            | `npm run build --workspaces --if-present` build semua dulu          |
| Publish version mismatch               | `changesets` auto-handle `workspace:*` → `^x.y.z`                   |
| MCP docs stale (~17 refs)              | Phase 5 bulk replace setelah Phase 4 hijau                          |

## Verification checklist (setelah conversion)

- [ ] `npm install` di root hijau (single node_modules)
- [ ] `npm run build` — 163 pages (site)
- [ ] `npm run build --workspaces --if-present` — ai + react build
- [ ] `npm run typecheck` — EXIT 0
- [ ] `npm run check` — EXIT 0
- [ ] `npm test` — 39/39
- [ ] `node packages/cli/src/index.js --version` — CLI works
- [ ] `node packages/mcp/index.js --help` — MCP works
- [ ] `git status` — single lockfile, no cli/mcp node_modules
- [ ] `npx changeset status` — baseline clean
- [ ] 5 importers `@/lib/ai` still resolve (shim works)

## References

- `HANDOFF.md` — current state + active plan
- `HANDOFF.archive/gotchas.md` — full gotcha detail
- `HANDOFF.archive/patterns.md` — PowerShell recipes
- `HANDOFF.archive/session-ai-port.md` — lib/ai implementation history
