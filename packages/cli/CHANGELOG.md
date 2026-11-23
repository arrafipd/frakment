# frakment

## 2.0.3

### Patch Changes

- 6ea441c: Stop `frakment init` from installing the animation dependency by default.

## 2.0.2

### Patch Changes

- 942e191: Stop `frakment init` from scaffolding the obsolete `lib/animation.ts` helper.

## 2.0.1

### Patch Changes

- e9f81fa: Build the published binaries as JavaScript before packing so Node.js can run them from `node_modules`, and point the CLI's shipped registry configuration at the canonical Frakment URL.

## 2.0.0

### Major Changes

- 762b982: Align the public registry catalog and MCP scenario compositions with the current component set.
- a17a0aa: Require Node.js 22.18.0 or newer to run TypeScript entry points directly.

## 1.0.0

### Major Changes

- f5e5ddc: Message consolidation. Message, Bubble, MessageScroller, and MessageAnimated now ship as a single `message` registry component. `npx frakment add message` installs everything: layout primitives, bubble with seven variants, the scroll engine, and the animated message renderer. `bubble`, `message-scroller`, and `message-animated` are no longer installable by name. `@frakment/react` is deprecated: its `message-scroller` engine is inlined into the `message` registry file. Migrate `import ... from "@frakment/react/message-scroller"` to `@/components/ui/message` after running `npx frakment@latest add message`. The `BubbleContent` `asChild` prop is replaced by `as`. Removes `radix-ui` and `ai` runtime dependencies from the consolidated component.
- e4c20ef: Replace `text-morph` with `number-flow`.

  `text-morph` is removed from the registry. The replacement is `number-flow`, a numeric slot machine built on `Intl.NumberFormat`. The `@number-flow/react` dependency is dropped — `number-flow` has no runtime dependencies.

  Projects using `text-morph` from a previous install keep the old file. New installs use `npx frakment add number-flow`.

  Text cycling that previously used `text-morph` (e.g. the package manager switcher) now uses inline motion.
- e1a0e1b: **Sonner is now a native toast engine.**

  The `sonner` registry component no longer depends on the `sonner` npm package. The toast state machine, engine, animations, and CSS ship inside `registry/sonner.tsx`. `toast` and `Toaster` are both exported from `@/components/ui/sonner`.
  - **Breaking**: `import { toast } from "sonner"` no longer resolves. Use `import { toast } from "@/components/ui/sonner"` instead. The `npx frakment add sonner` command still works; only the import path changes.
  - **Fixed**: `frakment.json` now declares `spinner` as a `registryDependency`. Installs previously missed `@/components/ui/spinner` and broke at runtime.
  - **Renamed**: Display name and docs path change from "Toast" to "Sonner".
  - **Fixed**: Component list grid now renders the blue dot for new components. Sidebar, mobile nav, and command menu already had it. Docs URL is `/docs/components/web/sonner` (redirect from `/docs/components/sonner`). Demo files renamed `toast-*` → `sonner-*`, exports renamed `Toast*` → `Sonner*`.

  The rendered UI, icons, themes, and toast behavior are byte-for-byte unchanged.

### Minor Changes

- dabf2d2: Button: replace `asChild` with an `href` prop.

  Pass `href` to render the button as a native anchor. `<Button href="/docs">Read the docs</Button>` produces a link without a wrapper. For client-side navigation with Next.js, React Router, or TanStack Router, apply the button styles with `buttonVariants` and render the router link component.

  The `button` registry entry no longer depends on `radix-ui`. Fresh installs of `npx frakment add button` pull only `class-variance-authority`.
- af03fa1: Add `--expo` flag to `frakment init` and `frakment add`.

  `frakment init --expo` scaffolds a NativeWind-ready Expo project with `components.json`, `lib/utils.ts`, and `lib/theme.ts`.

  `frakment add <name> --expo` installs React Native components from the Expo registry (`/r/expo`) using `npx expo install` for dependencies.
- e4caf59: Native primitives batch: dialog, item, checkbox, hover-card, and tabs drop `radix-ui` and ship as native implementations. Empty, field, code-block, and textarea docs migrate to `/docs/components/web/`. Changelog 2026-11-15 now covers all 17 components shipped today.

### Patch Changes

- 0e4723b: Label now ships without the `radix-ui` dependency. It renders a native `<label>` element with the same behavior; existing consumers using `htmlFor` and `className` are unaffected.

## 0.3.0

### Minor Changes

- 935312e: Add holo-card module: a card with a procedural foil that reacts to pointer tilt and device motion. Two variants: `card` (default) with a chip and an optional `logo`, and `image` with artwork under the foil. Two presets: `bursts` and `cosmos`. `logo` accepts a URL, plain text, or any ReactNode. `chip` overrides the built-in EMV chip.

### Patch Changes

- 4d16130: Fix `credit-card`: `CreditCardIssuer` no longer imports the site-internal `@/components/brand`. Pass a `logo` or `children` to render a mark; omitting both renders nothing. Fresh installs no longer fail with a module-not-found error.

## 0.2.0

### Minor Changes

- 22a0330: Add an `animation` prop to Accordion, Collapsible, Trace, Credit Card, and Text Morph. Accepts a string DSL: named easings (`"easeInOut"`, `"easeOutExpo"`), `"cubic-bezier(...)"`, `"spring(stiffness, damping)"`, plus `delay(...)` and `repeat(...)` options. Pass `animation={false}` to disable. Credit Card applies the transition per character. Text Morph overrides its `transition` prop when `animation` is set. Parsed by `parseAnimation` in `lib/animation.ts`, scaffolded by `frakment init`. Note: `inertia(...)` and `keyframes(...)` are parsed but have no visible effect on the five components yet.

## 0.1.0

### Minor Changes

- c961034: **Breaking:** animation constants renamed to camelCase in `lib/animation.ts`.

  Renames:
  - `springSmooth` -> `springSoft`
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
