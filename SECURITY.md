# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

Instead, report it privately using GitHub Security Advisories:

1. Go to https://github.com/arrafipd/frakment/security/advisories/new
2. Describe the vulnerability, steps to reproduce, and impact.
3. If possible, include a proof of concept or a suggested fix.

You will receive a response within **7 days**. If the issue is confirmed, a fix will be prepared and released as soon as possible. You will be credited in the advisory unless you prefer to remain anonymous.

## Scope

Security reports are welcome for:

- The `frakment` CLI (`cli/`)
- The `frakment-mcp` MCP server (`mcp/`)
- Components in `registry/`
- The documentation website (`app/`, `content/`)

Out of scope:

- Vulnerabilities in third-party dependencies. Please report those to the upstream project.
- Issues that require physical access to the user device.
- Social engineering or phishing.

## Supported versions

Security fixes land on the latest minor release. Older versions are not maintained.

## Recognition

Valid reports are credited in the corresponding GitHub Security Advisory. If you would like to be listed in a dedicated hall of fame, mention it in your report.
