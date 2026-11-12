---
name: frakment-usage
description: Load when an agent needs to discover, fetch, search, or install Frakment components. Covers the /r/index.json discovery endpoint, per-component JSON, and the frakment CLI.
allowed-tools: ["fetch", "bash"]
version: 0.1.0
---

# Frakment Usage

Frakment is a component registry for React interfaces. This skill teaches an agent how to discover, fetch, and install its components without guessing slugs.

## When to load this skill

Load when:

- The user asks what components are available in Frakment
- The user wants to install a specific Frakment component
- The user asks to find a component matching a description
- An agent needs to inspect the source of a Frakment component before writing code

Do not load when:

- The user is asking about a different component library
- The user needs only generic React patterns

## Registry surface

Index endpoint:

```bash
curl https://frakment.vercel.app/r/index.json
```

Response shape:

```json
{
  "name": "frakment",
  "homepage": "https://github.com/arrafipd/frakment",
  "components": [{ "name": "button", "title": "Button", "description": "..." }]
}
```

Per-component endpoint:

```bash
curl https://frakment.vercel.app/r/button.json
```

Response has `files[]` (each with `path`, `content`, and optionally `encoding: "base64"` for binary assets), `dependencies[]` (npm), and `registryDependencies[]` (other Frakment components).

## Steps

**First time setup.** If `components.json` does not exist yet, run `npx frakment@latest init` before adding components. This injects the theme block into `globals.css`, creates `lib/utils.ts`, and installs the base dependencies (`clsx`, `tailwind-merge`, `class-variance-authority`, `radix-ui`, `lucide-react`, `motion`). Safe to skip when `components.json` is already present.

## MCP compose

If the agent runs through MCP (`npx -y @frakment/mcp`), two tools avoid manual discovery:

- `list_scenarios` — no input. Returns the built-in compositions: `chat`, `agent-timeline`, `code-output`, `login-form`, `settings-panel`, `empty-state`, `search-input`, `status-dashboard`.
- `compose({ scenario })` — returns components, resolved dependencies, and the install command for one scenario. Prefer this over guessing component sets from the registry index.

Example:

```json
{ "tool": "compose", "arguments": { "scenario": "chat" } }
```

Returns `bubble, message, message-scroller, avatar, message-animated` plus `npx frakment@latest add message-animated` — that single add pulls the rest via `registryDependencies`.

## Steps

When not using MCP tools, follow these steps directly against the registry HTTP surface.

1. **Discover** - fetch `/r/index.json` and pick a component name from `components[].name`. Never invent a slug.
2. **Inspect** (optional) - fetch `/r/<name>.json` to read the source before using it.
3. **Install** - prefer the CLI:

   ```bash
   npx frakment@latest add <name>
   ```

   The CLI resolves `registryDependencies` recursively and installs npm dependencies automatically.

4. **Fallback** - if the CLI is not available, write each `files[].content` to its `files[].path` (decode base64 when `encoding: "base64"`), then run `npm install` for the listed `dependencies`.

## Constraints

- **Never guess component names.** Always fetch `/r/index.json` first.
- **Frakment is standalone.** Do not invoke another registry CLI against it.
- **Respect registryDependencies.** Install them before their consumers. The CLI handles ordering.
- **Do not summarize source.** When fetching `/r/<name>.json` for inspection, quote it verbatim.

## Output format

When listing components, return a markdown table:

| Name   | Description                                          |
| ------ | ---------------------------------------------------- |
| button | A monochrome button with six variants and six sizes. |

When suggesting an install, show the command in a code block, one line, no `$` prefix.
