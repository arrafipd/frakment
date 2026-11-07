# Session: Theme contrast & disabled state fixes

Date: 2026-11-08
Branch: main
Starting commit: 380bcbd (HANDOFF.md was stale at 0fc269e)

## Problem

Model Selector demo (AI Element composition) showed text and icons nearly
indistinguishable from the background in both light and dark mode. Multiple
edits to `theme.css` tokens had no visible effect.

## Root causes (in order of discovery)

1. `<body>` had `text-foreground` but no `bg-background`. In dark mode the
   canvas stayed transparent (browser default white), so white foreground
   text was invisible.
2. `InputGroup` applied `has-disabled:opacity-50` on the whole group. Because
   the Send button is disabled when the textarea is empty, the entire
   composer rendered at 50% opacity.
3. `InputGroup` also applied `has-disabled:bg-input/50` (light) and
   `dark:has-disabled:bg-input/80`, so the border and background dimmed on
   disabled.
4. An earlier "fix" added `text-foreground` to the `inputGroupButtonVariants`
   base cva string, which overrode `text-primary-foreground` from
   `variant="default"`. Result: white text on a light primary background.
5. `disabled:opacity-50` on `button.tsx` kept the Send icon faded even after
   the group opacity was removed.

## Changes

### Layout
- `app/layout.tsx` — added `bg-background` to `<body>` className.

### Token (theme.css + packages/cli/templates/theme.css, kept identical)
- `--muted-foreground`: light 0.556 to 0.50, dark 0.708 to 0.75
- `--border`: light 0.922 to 0.90, dark 10% to 14%
- `--input`: light 0.922 to 0.86, dark 15% to 25%
- Added `--subtle-foreground` (light 0.32, dark 0.88) and registered
  `--color-subtle-foreground` in `@theme inline`.
- `--sidebar-primary` dark: `oklch(0.488 0.243 264.376)` to
  `oklch(0.488 0 0)`.

### Components
- `input-group.tsx` (both copies): removed `has-disabled:opacity-50`,
  `has-disabled:bg-input/50`, `dark:has-disabled:bg-input/80`. Addon uses
  `text-subtle-foreground`. Text uses `text-foreground` with
  `[&_svg:not([class*='text-'])]:text-muted-foreground`. Base cva back to
  `"flex items-center gap-2 text-sm shadow-none"`.
- `button.tsx` (both copies): `disabled:opacity-50` replaced with
  `disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100`.
- `input-otp.tsx` (both copies): removed `has-disabled:opacity-50`.
- `native-select.tsx`: removed `has-[select:disabled]:opacity-50`.
- `alert.tsx` (both copies): destructive uses `--destructive` tokens; info
  uses muted tokens.
- `sonner.tsx` (both copies): info icon uses muted tokens.
- `command.tsx` (both copies): selected item uses
  `bg-foreground text-background`.
- `kbd.tsx`: `bg-muted shadow-foreground/10` replaces black/white overlays.
- `prompt-input.tsx`: disabled state uses `bg-muted text-muted-foreground`.

### Docs
- `content/docs/components/input-group.mdx` L189 and
  `content/docs/components/button.mdx` L327 updated to describe the new
  disabled behavior.
- `content/docs/changelog/2026-11-08.mdx` new entry.

### Registry
- `npm run registry:build` succeeded, 47 components rebuilt, EXIT=0.

## Verification

- `npm run build` exit 0, 267 pages, no EBADENGINE warnings.
- Console at `/docs/ai-elements/model-selector`:
  body bg = `lab(2.75 0 0)` (was transparent),
  input-group opacity = `1` (was `0.5`),
  disabled Send bg = muted, color = muted-foreground, opacity = `1`.

## Node environment

- Upgraded Node 22.19.0 to 26.13.0.
- Removed nvm-windows fully (`C:\nvm4w`, `NVM_HOME`, `NVM_SYMLINK`, PATH).
- `where.exe node` returns `C:\Program Files\nodejs\node.exe` only.
- npm 12.2.1.
- Approved `ffmpeg-static` install script.

## Remaining

- Commit docs and rebuilt registry JSON.
- Token audit complete: no hardcoded Tailwind colors in components except
  `.hljs-*` syntax highlighting and `--destructive` (both intentional).