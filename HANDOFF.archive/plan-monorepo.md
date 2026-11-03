↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Monorepo Conversion + npm Publish Plan

Convert Frakment from polyrepo-lite (3 separate node_modules + 3 lockfiles) to a proper npm workspace monorepo with changesets.

## Current state

| Package | Path   | Name                 | node_modules | Lockfile |
| ------- | ------ | -------------------- | ------------ | -------- |
| Site    | `/`    | `frakment` (private) | 671 MB       | 398 KB   |
| CLI     | `/cli` | `frakment`           | 1.1 MB       | 14 KB    |
| MCP     | `/mcp` | `frakment-mcp`       | 16.6 MB      | 43 KB    |

**Problems:** 3x npm install, 3x lockfile, root+CLI nama sama (`frakment` collision), no shared tooling, publish manual 30-45 menit.

## Target state

```
C:\Users\PC\Desktop\frakment\
├── package.json          ← name: frakment-site, workspaces: [packages/*, cli, mcp]
├── .changeset/
├── packages/
│   ├── ai/               ← @frakment/ai (from lib/ai/)
│   └── react/            ← @frakment/react (skeleton)
├── lib/ai.ts             ← shim re-export from @frakment/ai
├── cli/                  ← frakment (workspace)
├── mcp/                  ← frakment-mcp (workspace)
├── node_modules/         ← single hoisted
└── package-lock.json     ← single lockfile
```

## Phase 1 — Root package.json + changesets (10 mnt)

1. Rename root `frakment` → `frakment-site` (hindari collision dengan CLI `frakment`)
2. Tambah `workspaces: ["packages/*", "cli", "mcp"]`
3. Tambah devDep `@changesets/cli`
4. Scripts: `changeset`, `version:packages`, `release`
5. `.changeset/config.json` — access public, baseBranch main
6. `.changeset/README.md` — workflow doc

## Phase 2 — Move lib/ai → packages/ai (30 mnt)

1. Buat `packages/ai/` folder
2. `packages/ai/package.json` — name `@frakment/ai` v0.0.1, exports dist/index.js + dist/index.d.ts, peerDeps `ai: >=7`
3. `packages/ai/tsconfig.json` — extends root, outDir dist
4. `packages/ai/tsup.config.ts` — entry src/index.ts, format ESM, dts, clean
5. Copy `lib/ai/*.ts` → `packages/ai/src/*.ts` (10 files)
6. `packages/ai/src/index.ts` — re-export `createChat`, `getMessageText`, semua types
7. Update `lib/ai.ts` → `export { createChat, getMessageText } from "@frakment/ai"; export type { ... } from "@frakment/ai";`
8. Verify 5 importers tetap resolve:
   - `components/message-animated.tsx`
   - `examples/chain-of-thought-demo.tsx`
   - `examples/message-scroller-demo.tsx`
   - `examples/terminal-demo.tsx`
   - `registry/message-animated.tsx`

## Phase 3 — Skeleton packages/react (15 mnt)

1. Buat `packages/react/` folder
2. `packages/react/package.json` — name `@frakment/react` v0.0.1, peerDeps `react: >=19`, `react-dom: >=19`
3. `packages/react/tsconfig.json` + `tsup.config.ts` (mirror ai)
4. `packages/react/src/index.ts` — placeholder `export {};` (engine diisi sesi berikutnya)
5. `packages/react/README.md` — roadmap link `/docs/libraries/react`

## Phase 4 — Cleanup + install + verify (30 mnt)

1. Delete `cli/node_modules`, `mcp/node_modules` (hoist via workspace)
2. Delete `cli/package-lock.json`, `mcp/package-lock.json` (single root lockfile)
3. Update `next.config.mjs` — `transpilePackages: ["@frakment/ai", "@frakment/react"]`
4. `npm install` di root (single hoist)
5. `npm run build --workspaces --if-present`
6. Verify: `npm run build` (163 pages), `npm run typecheck`, `npm run check`, `npm test` (39/39)
7. `node cli/src/index.js --version` — CLI works
8. `node mcp/index.js --help` — MCP works
9. Commit + push

## Publish workflow

### Setup one-time

```bash
npm install                              # single root install
npm run build --workspaces --if-present  # build ai + react
```

### Publish cycle (setiap release)

```bash
npm run changeset         # pilih package + bump (patch/minor/major) + summary
npm run version:packages  # bump version + CHANGELOG.md per package
npm run release           # build all + changeset publish + git tag
```

### Publish besok (3 packages)

```bash
npm run changeset       # pilih 3: frakment, frakment-mcp, @frakment/ai
npm run version:packages
npm run release
```

`@frakment/react` di-publish terpisah setelah engine selesai.

## Publish targets

| Package      | Npm name          | Path              | Publish besok?                  |
| ------------ | ----------------- | ----------------- | ------------------------------- |
| AI engine    | `@frakment/ai`    | `packages/ai/`    | ✅ siap (dari `lib/ai` kemarin) |
| React engine | `@frakment/react` | `packages/react/` | ❌ engine belum diisi           |
| CLI          | `frakment`        | `cli/`            | ✅ siap                         |
| MCP server   | `frakment-mcp`    | `mcp/`            | ✅ siap                         |
| Site         | `frakment-site`   | `/` (root)        | ❌ private                      |

## Rules

- Root `package.json` `private: true` — tidak pernah publish
- `packages/*`, `cli`, `mcp` — publishable
- Scope `@frakment/*` untuk library packages; `frakment` + `frakment-mcp` untuk CLI/server
- `changesets` handle: version bump, internal dep update (`workspace:*` → `^x.y.z` saat publish), CHANGELOG, git tag
- Setiap package punya `README.md` sendiri sebelum publish
- Test `npm pack` per package sebelum publish (verify isi tarball)

## Risks + mitigations

| Risk                                   | Mitigation                                                          |
| -------------------------------------- | ------------------------------------------------------------------- |
| Root dan CLI sama-sama `frakment`      | Rename root → `frakment-site` (Phase 1)                             |
| CLI/MCP deps konflik dengan root       | `npm install --workspaces` resolve; kalau error, pin version manual |
| Site break setelah `lib/ai` di-extract | Shim `lib/ai.ts` re-export — 5 importers tidak berubah              |
| `transpilePackages` lupa               | Phase 4 step 3 wajib                                                |
| Build order                            | `npm run build --workspaces --if-present` build semua dulu          |
| Publish version mismatch antar package | `changesets` auto-handle `workspace:*` → `^x.y.z`                   |

## Verification checklist (setelah conversion)

- [ ] `npm install` di root hijau (single node_modules)
- [ ] `npm run build` — 163 pages (site)
- [ ] `npm run build --workspaces --if-present` — ai + react packages build
- [ ] `npm run typecheck` — EXIT 0
- [ ] `npm run check` — EXIT 0
- [ ] `npm test` — 39/39
- [ ] `node cli/src/index.js --version` — works
- [ ] `node mcp/index.js --help` — works
- [ ] `git status` — single lockfile, no cli/mcp node_modules
- [ ] `npx changeset status` — no pending changes (baseline)

## References

- `HANDOFF.md` — current state + active plan
- `HANDOFF.archive/gotchas.md` — full gotcha detail
- `HANDOFF.archive/patterns.md` — PowerShell recipes
- `HANDOFF.archive/session-ai-port.md` — lib/ai implementation history
