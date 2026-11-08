<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
  <img src="assets/logo.svg" width="72" height="72" alt="Frakment">
</picture>

# Frakment

**The Fragments behind your Design System.**

Composable, accessible, customizable — nothing to assemble.<br/>
With AI and motion. No wiring. No configuration.

[![License](https://img.shields.io/badge/license-source--available-blue?style=for-the-badge)](LICENSE)
[![npm](https://img.shields.io/npm/v/frakment?style=for-the-badge&color=000)](https://www.npmjs.com/package/frakment)
[![CI](https://img.shields.io/github/actions/workflow/status/arrafipd/frakment/ci.yml?style=for-the-badge&label=CI)](https://github.com/arrafipd/frakment/actions/workflows/ci.yml)

<img src="assets/hero-dark.webp" alt="Frakment homepage" width="100%">

</div>

---

**Frakment** is a component registry for React interfaces. Every component is standalone — depends only on a small set of well-known libraries, and ships as open source you can read, copy, and modify.

## Highlights

**Standalone by default** — one file per component. No wrapper, no chain, no hidden dependency tree.

**AI and motion, built in** — agent surfaces ship with AI support and motion resolved per file. Baseline primitives stay motion-ready without extra setup.

**Built for agents** — MCP server and Agent Skills let tools discover, fetch, and install components autonomously.

**Copy-paste first** — one command installs a component plus its registry dependencies.

## Components

| Category | Components |
| :--- | :--- |
| **Chat** | Bubble · Message · Attachment |
| **Agent** | Trace · Chain of Thought |
| **Code** | Code Block |
| **Status** | Marker · Spinner · Pulse · Pulse Status |
| **Forms** | Input · Textarea · Field · Label · Checkbox · Switch · Select |
| **Layout** | Item · Separator · Card · Input Group · Empty |
| **Controls** | Button · Badge · Toggle · Toggle Group |
| **Identity** | Avatar |

Browse the full catalog → **[www.arrafi.dev/frakment/docs/components](https://www.arrafi.dev/frakment/docs/components)**

## Quick start

```bash
npx frakment@latest init
npx frakment@latest add bubble
```

`add` fetches the component and its registry dependencies, writes the files, and installs any missing npm packages.

## Built for agents

Frakment ships with an MCP server and Agent Skills so AI tools can discover and install components without scraping HTML.

```bash
npx -y @frakment/mcp
```

- **MCP server** → [www.arrafi.dev/frakment/docs/mcp](https://www.arrafi.dev/frakment/docs/mcp)
- **Agent Skills** → [www.arrafi.dev/frakment/docs/skills](https://www.arrafi.dev/frakment/docs/skills)
- **llms.txt** → [www.arrafi.dev/frakment/llms.txt](https://www.arrafi.dev/frakment/llms.txt)

## Documentation

| | |
| :--- | :--- |
| [**Components**](https://www.arrafi.dev/frakment/docs/components) | Baseline primitives — Button, Input, Field, Card, and more |
| [**AI Elements**](https://www.arrafi.dev/frakment/docs/ai-elements) | Chat, agent, and reasoning primitives |
| [**Installation**](https://www.arrafi.dev/frakment/docs/installation) | Setup for Next.js, Vite, Astro, and manual |
| [**Theming**](https://www.arrafi.dev/frakment/docs/theming) | CSS variables, dark mode, and tokens |
| [**MCP Server**](https://www.arrafi.dev/frakment/docs/mcp) | Registry discovery for AI tools |
| [**Changelog**](https://www.arrafi.dev/frakment/docs/changelog) | What shipped, when |

## Contributing

Contributions are welcome — typo fixes, docs, tests, translations, or new components. See [CONTRIBUTING.md](./CONTRIBUTING.md).

A merged pull request satisfies the commercial-use requirement in the license.

## License

Source-available. Free for personal and educational use. Commercial use requires one qualifying contribution — see [LICENSE](./LICENSE) Section 4.

Attribution required — see [ATTRIBUTION.md](./ATTRIBUTION.md).

## Utilities

| Utility | Description |
| :--- | :--- |
| [Scroll fade](https://www.arrafi.dev/frakment/docs/utilities/scroll-fade) | Scroll-aware mask gradients for overflow containers |
| [Shimmer](https://www.arrafi.dev/frakment/docs/utilities/shimmer) | Animated gradient over text for loading states |
| [MCP Server](https://www.arrafi.dev/frakment/docs/utilities/mcp) | Registry discovery for AI tools |
| [Skills](https://www.arrafi.dev/frakment/docs/utilities/skills) | Agent skill definitions |
| [Agents](https://www.arrafi.dev/frakment/docs/utilities/agents) | AI agent patterns |

