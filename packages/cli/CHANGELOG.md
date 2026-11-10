# frakment

## 0.1.0

### Minor Changes

- c961034: **Breaking:** animation constants renamed to camelCase in `lib/animation.ts`.
  
  Renames:
  - `SPRING_SMOOTH` -> `springSoft`
  - `EASE_OUT` -> `easeOutExpo`
  - `EASE_SMOOTH` -> `easeSmoothOut`
  - `EASE_IN_OUT` -> `easeInOut`
  - `DURATION_FAST` -> `durationFast`
  - `DURATION_SMOOTH` -> `durationSlow`
  
  New exports: `easeInOutQuad`, `durationNormal`, `delayTight`.
  
  Migration: run `npx frakment@latest init` to regenerate `lib/animation.ts` (safe to overwrite - the old file only contains the renamed constants), or update imports in components that use these constants.
  
  Also adds the Credit Card module: auto brand detection, number and expiry formatting, `masked` prop, `glass` variant, and compound sub-components (Header, Issuer, Brand, Number, Footer, Holder, Expiry).

## 0.0.7

### Patch Changes

- cf2dbaa: Validate registry component payloads and add dry-run controls for safer component installation.

## 0.0.6

### Patch Changes

- f53057c: Add `repository.url` to `package.json` so OIDC trusted publishing can verify provenance. Fixes E422 on publish.

## 0.0.5

### Patch Changes

- 8e4a9bb: Switch to MIT license. Include LICENSE file in published package. Update package.json license field from "SEE LICENSE IN LICENSE" to "MIT".
