<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="apps/web/assets/logo-dark.svg">
  <img src="apps/web/assets/logo.svg" width="72" height="72" alt="Frakment">
</picture>

# Frakment

**The Fragments behind your Design System.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![npm](https://img.shields.io/npm/v/frakment?style=for-the-badge&color=000)](https://www.npmjs.com/package/frakment)
[![CI](https://img.shields.io/github/actions/workflow/status/arrafipd/frakment/ci.yml?style=for-the-badge&label=CI)](https://github.com/arrafipd/frakment/actions/workflows/ci.yml)

</div>

<img src="apps/web/assets/hero-dark.webp" alt="Frakment homepage" width="100%">

A component registry for React — copy-paste components you own, with no lock-in.

```bash
npx frakment@latest init
npx frakment@latest add button
```

- **43 web components** across primitives, AI elements, composites, and utilities
- **3 native components** for Expo and React Native
- **Accessible interactions** — interactive components include keyboard and ARIA behavior
- **Configurable web transitions** — supported components expose CSS motion controls

**[Documentation](https://www.arrafi.dev/frakment/docs)** · **[Components](https://www.arrafi.dev/frakment/docs/components)** · **[Changelog](https://github.com/arrafipd/frakment/releases)**

## Requirements

Node.js `>=22.18.0` · React `19` · Tailwind CSS `v4`

## Package manager

Both **npm** and **pnpm** are supported. CI runs every PR against both, and the workspace scripts detect the active package manager automatically.

```bash
npm ci && npm run build      # or: pnpm install && pnpm build
```

See [CONTRIBUTING.md](https://github.com/arrafipd/frakment/blob/main/CONTRIBUTING.md#package-manager) for the full policy, lockfile rules, and troubleshooting.

## Contributing

See [CONTRIBUTING.md](https://github.com/arrafipd/frakment/blob/main/CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE) and [third-party notices](./docs/legal/THIRD_PARTY_NOTICES.md).