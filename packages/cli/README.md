# frakment CLI

[![npm](https://img.shields.io/npm/v/frakment?style=for-the-badge&color=000)](https://www.npmjs.com/package/frakment)
[![License](https://img.shields.io/badge/license-source--available-blue?style=for-the-badge)](./LICENSE)

Monochrome design system and component registry CLI.

## Requirements

- Node.js >= 22.12.0
- Tailwind CSS v4 (`@import "tailwindcss";` in your `globals.css`)

## Package managers

The commands below use `npx`. Every package manager works.

| Package manager | Run |
| :-- | :-- |
| npm | `npx frakment@latest <command>` |
| pnpm | `pnpm dlx frakment@latest <command>` |
| yarn | `yarn dlx frakment@latest <command>` |
| bun | `bunx frakment@latest <command>` |

The CLI auto-detects your package manager from the project lockfile when installing dependencies.

## Usage

### `frakment init`

```bash
npx frakment@latest init
```

What it does:

1. Writes `components.json` at project root (CLI config)
2. Injects the theme block into `globals.css` between `/* ==== FRAKMENT THEME START/END ==== */` markers (design tokens + 9 `@utility` + `.dark` + `@custom-variant dark`)
3. Preserves anything outside the markers — your `@import` statements, overrides, and custom CSS stay untouched
4. Creates `lib/utils.ts` (the `cn` helper) if missing
5. Installs 6 dependencies: `clsx`, `tailwind-merge`, `class-variance-authority`, `radix-ui`, `lucide-react`, `motion`

**Idempotent.** Safe to re-run:

- Existing `components.json` is preserved unless you choose to overwrite
- Marker block is replaced in place (no duplicates)
- Legacy inline theme blocks (from older `init` versions) are auto-migrated

### `frakment add <component>`

```bash
npx frakment@latest add button
```

Fetches the component (plus all `registryDependencies` recursively) from the registry, writes all files, and installs any missing npm dependencies.

Flags:

- `--registry <url>` — override the registry URL (default: from `components.json`)
- `--overwrite` — overwrite existing files without prompting

### `frakment list`

```bash
npx frakment@latest list
```

Lists all available components from the registry.

## Registry

The default registry URL is written to `components.json` during `init`. If the public registry is not live yet, pass `--registry <url>` explicitly:

```bash
npx frakment@latest add badge --registry http://localhost:8765
```

## Troubleshooting

### "Frakment requires Tailwind v4"

Your `globals.css` must contain `@import "tailwindcss";`. Frakment relies on Tailwind v4 features (`@theme`, `@utility`, `@custom-variant`). Tailwind v3 is not supported.

### "Could not find globals.css"

The CLI looks for one of:

- `app/globals.css`
- `src/app/globals.css`
- `styles/globals.css`
- `src/styles/globals.css`

If none exist, create one with at minimum:

```css
@import "tailwindcss";
```

### `src/` directory projects

If your `globals.css` lives at `src/app/globals.css`, component files are written to `src/components/`, `src/lib/`, `src/hooks/`. Binary assets under `public/` are written to `public/` at the project root (Next.js serves `public/` from the root regardless of `src/` layout).

## License

Source-available. See [LICENSE](./LICENSE). Commercial use requires at least one merged pull request to [arrafipd/frakment](https://github.com/arrafipd/frakment).
