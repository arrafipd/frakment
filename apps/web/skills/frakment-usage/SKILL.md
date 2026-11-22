---
name: frakment-usage
description: Provider-neutral instructions for discovering, inspecting, and installing Frakment web and Expo components through HTTP, MCP, or the CLI.
version: 0.2.0
---

# Frakment Usage

Frakment is a component registry for React web and Expo interfaces.

These instructions use standard HTTP, MCP, and CLI workflows and can be loaded by any assistant that can read Markdown.

Automatic skill discovery and available tools vary by AI client.

The skill supplies instructions but does not grant network, terminal, or project-write permissions.

## When to load this skill

Load when:

- The user asks what components are available in Frakment
- The user wants to install a specific Frakment component
- The user asks to find a component matching a description
- An agent needs to inspect the source of a Frakment component before writing code

Do not load when:

- The user is asking about a different component library
- The user needs only generic React patterns

## Registry endpoints

Use the web registry for React components:

```bash
curl https://www.arrafi.dev/frakment/r/index.json
```

Use the Expo registry for React Native components:

```bash
curl https://www.arrafi.dev/frakment/r/expo/index.json
```

Fetch one component from the matching registry:

```bash
curl https://www.arrafi.dev/frakment/r/button.json
curl https://www.arrafi.dev/frakment/r/expo/button.json
```

Each index contains `components[]` entries with `name`, `title`, and `description`.

Each component JSON contains `files[]`, `dependencies[]`, and `registryDependencies[]`.

Component files can include `encoding: "base64"` for binary assets.

The default registry root is `https://www.arrafi.dev/frakment`.

The web registry index response has this shape:

```json
{
  "name": "frakment",
  "homepage": "https://github.com/arrafipd/frakment",
  "components": [{ "name": "button", "title": "Button", "description": "..." }]
}
```

## Steps

<!-- context-drift-ignore-next-line CD001 -->
If `components.json` does not exist, initialize Frakment in the existing project before adding components.

For web projects, run `npx frakment@latest init`; web components require React 19 and Tailwind CSS v4.

For Expo projects, run `npx frakment@latest init --expo` after configuring Expo and NativeWind.

The CLI and MCP server require Node.js 22.18.0 or newer.

## MCP compose

Use MCP from any AI client that supports MCP over stdio.

The Frakment MCP server exposes web components only; use the Expo registry endpoints and the CLI for native components.

Set `FRAKMENT_REGISTRY` to a registry root when using a self-hosted registry.

The MCP tools are:

- `list_components` lists all web components.
- `search_components({ query })` searches web component names and descriptions.
- `view_component({ name })` returns a web component's source and dependencies.
- `get_install_command({ name })` formats a CLI command and does not validate the name.
- `list_scenarios` lists the available compositions.
- `compose({ scenario })` returns curated component names, an install command, and a dependency note.

The built-in scenarios are `chat`, `agent-timeline`, `code-output`, `empty-state`, `login-form`, `search-input`, and `settings-panel`.

The CLI resolves registry dependencies; MCP does not execute commands or write files.

Example:

```json
{ "tool": "compose", "arguments": { "scenario": "chat" } }
```

The `chat` scenario returns `message` and `avatar` with an install command for `message`; add `avatar` separately if the design needs it.

## Discover and install

Choose the index that matches the target platform. <!-- context-drift-ignore-next-line CD001 -->
1. **Discover** the component name from `/r/index.json` for web or `/r/expo/index.json` for Expo; never invent a slug.
2. **Inspect** the matching component JSON when source details are needed.
3. **Install** with the CLI from the target project:

   ```bash
   npx frakment@latest add <name>
   ```

   Add `--expo` for native components.

   The CLI resolves `registryDependencies` recursively and installs npm dependencies automatically.

4. **Fallback** to the JSON files only when the CLI is unavailable.

   Fetch each registry dependency recursively, write every file to its declared path, decode base64 assets when indicated, and install the listed npm dependencies with the project's package manager.

   For Expo projects, use `npx expo install` for native dependencies when required.

## Constraints

- **Never guess component names.** Use the web or Expo index for the matching platform.
- **Verify before suggesting commands.** MCP's `get_install_command` formats a command and does not validate the component name.
- **Respect registry dependencies.** The CLI handles recursive dependency ordering.
- **Do not claim MCP installed anything.** It only returns information and commands.
- **Preserve source accurately.** Do not omit files or silently alter fetched component code.

## Output format

When listing multiple components, include their exact registry names and descriptions.

| Name   | Description                                          |
| ------ | ---------------------------------------------------- |
| button | A monochrome button with six variants and six sizes. |

When suggesting an install, show the command in a code block without a shell prompt.
