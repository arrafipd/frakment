# @frakment/mcp

[![npm](https://img.shields.io/npm/v/@frakment/mcp?style=for-the-badge&color=000)](https://www.npmjs.com/package/@frakment/mcp)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)

Model Context Protocol server for the [Frakment](https://github.com/arrafipd/frakment) component registry.

Exposes the registry as MCP tools so any MCP-capable agent can browse, search, and install Frakment components without scraping HTML or writing HTTP glue.

## Install

```bash
npx -y @frakment/mcp
```

Or pin it as a dev dependency:

```bash
npm install --save-dev @frakment/mcp
```

## Configure your MCP client

Add to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`):

```json
{
  "mcpServers": {
    "frakment": {
      "command": "npx",
      "args": ["-y", "@frakment/mcp"]
    }
  }
}
```

For Cursor, add the same block to `~/.cursor/mcp.json`.

## Tools

| Tool                  | Input                  | Output                                                |
| --------------------- | ---------------------- | ----------------------------------------------------- |
| `list_components`     | none                   | List of every component with name and description.    |
| `view_component`      | `{ "name": "button" }` | Full source, npm dependencies, registry dependencies. |
| `search_components`   | `{ "query": "chat" }`  | Components matching name or description substring.    |
| `get_install_command` | `{ "name": "button" }` | The exact `npx frakment@latest add <name>` command.   |
| `list_scenarios`      | none                   | Ready-made compositions for common UI scenarios.      |
| `compose`             | `{ "scenario": "chat" }` | Components, resolved deps, and install command.     |

## Environment

| Variable            | Default                       | Purpose                                                                                       |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `FRAKMENT_REGISTRY` | `https://frakment.vercel.app` | Override the registry base URL. Useful for local development against `http://localhost:3000`. |

## Development

From the `packages/mcp/` folder:

```bash
npm install
node index.js
```

The server speaks JSON-RPC over stdin/stdout. Any MCP client that spawns subprocesses can launch it.

## License

MIT licensed. See [LICENSE](./LICENSE).
