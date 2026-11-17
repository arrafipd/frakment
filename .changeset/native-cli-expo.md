---
"frakment": minor
---

Add `--expo` flag to `frakment init` and `frakment add`.

`frakment init --expo` scaffolds a NativeWind-ready Expo project with `components.json`, `lib/utils.ts`, and `lib/theme.ts`.

`frakment add <name> --expo` installs React Native components from the Expo registry (`/r/expo`) using `npx expo install` for dependencies.