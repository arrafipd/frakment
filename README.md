<p align="center">
  <strong>Frakment</strong>
</p>

<p align="center">
  Standalone React primitives for AI and chat interfaces.<br/>
  Zero external registry. Copy-paste. Built for agents too.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-source--available-blue?style=flat-square" alt="License" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/version-0.1.0-green?style=flat-square" alt="Version" /></a>
</p>

---

**Frakment** is a monochrome component registry for AI and chat interfaces. Every component is standalone - no external registry chain, no hidden dependencies. Install one, drop it in, done.

## Features

- **Standalone** - single file per component, no wrapper, no hidden chain.
- **AI-first** - Bubble, Message, Trace, Chain of Thought, Pulse, Terminal.
- **Agents included** - MCP server and Agent Skills for discover, fetch, and install.
- **Copy-paste** - one command installs a component plus its registry dependencies.
- **Monochrome** - neutral, precise, consistent by design.

## Documentation

Visit **[frakment.vercel.app/docs](https://frakment.vercel.app/docs)** for the full reference.

- [Components](https://frakment.vercel.app/docs/components)
- [AI Elements](https://frakment.vercel.app/docs/ai-elements)
- [CLI](https://frakment.vercel.app/docs/installation)
- [MCP Server](https://frakment.vercel.app/docs/mcp)
- [Agent Skills](https://frakment.vercel.app/docs/skills)
- [Changelog](https://frakment.vercel.app/docs/changelog)

## Quick Start

```bash
npx frakment@latest init
npx frakment@latest add bubble
```

Or use it as an MCP server for agents:

```bash
npx -y @frakment/mcp
```

## Contributing

Contributions are welcome - typo fixes, docs, tests, translations, or new components. See [CONTRIBUTING.md](./CONTRIBUTING.md). A merged pull request satisfies the commercial-use requirement in the license.

## License

Source-available. Free for personal and educational use. Commercial use requires one qualifying contribution - see [LICENSE](./LICENSE) Section 4. Attribution required - see [ATTRIBUTION.md](./ATTRIBUTION.md).
