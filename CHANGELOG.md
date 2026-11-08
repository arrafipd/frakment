# Changelog

All notable changes to Frakment. Full per-component history at [arrafi.dev/frakment/docs/changelog](https://www.arrafi.dev/frakment/docs/changelog).

## CLI

### 0.0.4

- Terminal output aligned to shadcn/ui. Migrated from `@clack/prompts` + `picocolors` to `prompts` + `chalk` + `ora`.
- `init` installs `lucide-react` instead of `@phosphor-icons/react` (site-only library).
- `bin/index.js` and `list.js` migrated to new dependency stack (were broken in 0.0.3).
- `npx frakment@latest` resolves without `ERR_MODULE_NOT_FOUND`.
- Output: `✔` steps instead of `◇` frames, `Success!` message, cyan highlights for resolved values, no box-drawing character.

### 0.0.3

- Migrated `init` and `add` to `prompts` + `chalk` + `ora`.
- Added `Success!` message with timing hint, `✔` steps, cyan highlights.
- Removed `status-chip` placeholder in `init` outro (component does not exist in registry).

### 0.0.2

- Initial public release.
- Commands: `init`, `add`, `list`.
- Registry: `https://www.arrafi.dev/frakment/r`.

## Registry

- 46 components shipped across `components`, `ai-elements`, `modules`, `libraries`, `utilities`.
- `text-flip` renamed to `text-morph`, moved from Components to Modules.

## Packages

| Package | Version | Status |
| :-- | :-- | :-- |
| `frakment` | 0.0.4 | published |
| `@frakment/ai` | 0.0.1 | pending |
| `@frakment/react` | 0.0.1 | pending |
| `@frakment/mcp` | 0.0.2 | published |

## Site

- Changelog: [arrafi.dev/frakment/docs/changelog](https://www.arrafi.dev/frakment/docs/changelog)
- Git history: [github.com/arrafipd/frakment/commits/main](https://github.com/arrafipd/frakment/commits/main)