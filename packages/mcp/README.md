# @frakment/mcp

[![npm](https://img.shields.io/npm/v/@frakment/mcp?style=for-the-badge&color=000)](https://www.npmjs.com/package/@frakment/mcp)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)

Model Context Protocol server for the [Frakment](https://github.com/arrafipd/frakment) component registry.

Frakment is open source under the MIT License. Commercial use, modification, distribution, and sublicensing are permitted.

Exposes registry search, component source, compositions, and CLI install commands as MCP tools.

The MCP server does not write files into a project or execute the returned commands.

The MCP server exposes the web registry only. Use the Expo registry endpoints and the CLI `--expo` option for native components.

## Install

```bash
npx -y @frakment/mcp
```

Requires Node.js >= 22.18.0.

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

For VS Code with GitHub Copilot, save this as `.vscode/mcp.json`:

```json
{
  "servers": {
    "frakment": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@frakment/mcp"]
    }
  }
}
```

## Tools

| Tool                  | Input                  | Output                                                |
| --------------------- | ---------------------- | ----------------------------------------------------- |
| `list_components`     | none                   | List of every web component with name and description. |
| `view_component`      | `{ "name": "button" }` | Source files and dependency metadata; binary assets are labeled base64 text. |
| `search_components`   | `{ "query": "chat" }`  | Web components matching name or description.          |
| `get_install_command` | `{ "name": "button" }` | The exact web component install command.               |
| `list_scenarios`      | none                   | Ready-made compositions of web components.             |
| `compose`             | `{ "scenario": "chat" }` | Curated components, install command, and dependency note. |

`get_install_command` formats the supplied name without validating it; call `list_components` first to choose a valid slug.

## Environment

| Variable            | Default                       | Purpose                                                                                       |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `FRAKMENT_REGISTRY` | `https://www.arrafi.dev/frakment` | Registry root URL. Do not include the trailing `/r` path. |

## Development

From the `packages/mcp/` folder:

```bash
npm install
node index.ts
```

The server speaks JSON-RPC over stdin/stdout and works with MCP clients that support stdio subprocess servers.

Clients without MCP support can use the registry HTTPS endpoints and CLI directly.

## License

MIT licensed. See [LICENSE](./LICENSE).
