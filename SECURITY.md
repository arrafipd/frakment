# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

Report privately via GitHub Security Advisories:

1. Go to https://github.com/arrafipd/frakment/security/advisories/new
2. Describe the vulnerability, steps to reproduce, and impact.
3. Include a proof of concept or suggested fix if possible.

You will receive a response within **7 days**. If confirmed, a fix will be prepared and released as soon as possible. You will be credited in the advisory unless you prefer to remain anonymous.

## Scope

In scope:

- `frakment` CLI (`packages/cli`)
- `@frakment/mcp` server (`packages/mcp`)
- `@frakment/ai` engine (`packages/ai`)
- `@frakment/react` primitives (`packages/react`)
- Components in `registry/` and `public/r/`
- Documentation website (`app/`, `content/`)

Out of scope:

- Vulnerabilities in third-party dependencies. Report to the upstream project.
- Issues that require physical access to the user device.
- Social engineering or phishing.
- Resource exhaustion from intentional oversized input.

## Threat model

Frakment ships code that runs on the user's machine and fetches data from remote registries. The threat model covers three attack surfaces:

### CLI (`npx frakment add <name>`)

The CLI writes files into the user's project and installs npm dependencies from a remote registry.

Threats and mitigations:

- **Path traversal.** The CLI validates each registry file path before writing. Paths containing `..`, absolute paths, null bytes, and symlink escapes are rejected.
- **Arbitrary file overwrite.** Existing files are preserved unless `--overwrite` is passed. Overwrite requires per-file confirmation by default.
- **Untrusted dependency install.** The CLI validates registry payloads and accepts conventional npm package specifications only. Use `--dry-run` to review file and dependency changes, or `--skip-dependencies` to defer dependency installation.
- **Remote registry checksum.** Registry payloads include a SHA-256 checksum that the CLI verifies before writing files or installing dependencies. The checksum detects corruption, but it does not authenticate a registry because the registry serves both the payload and checksum.

### MCP server (`npx -y @frakment/mcp`)

The MCP server is spawned by the agent's MCP client and speaks JSON-RPC over stdin/stdout.

Threats and mitigations:

- **Auto-execute from remote.** `npx -y` skips install confirmation. Users who run MCP from untrusted configs should pin the version (`@frakment/mcp@0.0.3`) or install locally and reference the local binary.
- **Registry content treated as untrusted data.** Component sources, descriptions, and install commands from the registry are returned to the agent as data. Agents must treat this as untrusted and not follow instructions embedded in component content.
- **No shell execution.** The MCP server never spawns a shell or executes commands. It reads registry JSON and returns strings.

### Registry content (`llms.txt`, `public/r/*.json`)

Component metadata, source code, and install commands published to the registry are read by humans, CLIs, and AI agents.

Threats and mitigations:

- **Prompt injection in descriptions or source.** Descriptions and code are treated as data. Agents must not interpret embedded instructions in registry content as commands.
- **Tampered registry.** Publishing to the registry requires npm and GitHub credentials. A compromised registry or publisher can serve a matching malicious checksum, so use a trusted registry URL and review installed components. Report suspected tampering via Security Advisories.

## Known limitations

- CLI does not provide a diff against existing files.
- Registry checksums are not signed or pinned to a user-managed trusted key.
- The MCP server returns registry strings as-is without content filtering. Agents must apply their own trust boundaries.

## Supported versions

Security fixes land on the current `0.x` line for each package. Older versions are not maintained.

| Package | Current line |
| :-- | :-- |
| `frakment` | `0.1.0` |
| `@frakment/ai` | `0.0.5` |
| `@frakment/react` | `0.0.3` |
| `@frakment/mcp` | `0.0.3` |

## Recognition

Valid reports are credited in the corresponding GitHub Security Advisory. Mention it in your report if you would like to be listed in a dedicated hall of fame.
