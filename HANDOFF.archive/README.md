↑ [Back to HANDOFF](../HANDOFF.md)

# Archive — Index

Historical sessions and detailed references. Kept for grep when the daily `HANDOFF.md` pointer is not enough.

**Rule:** every file here has a `↑ Back to HANDOFF` link at the top. `HANDOFF.md` links back via the Archive Index section.

## Sessions (chronological)

| File                                                               | What                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| [session-docs-enrichment.md](./session-docs-enrichment.md)         | Docs enrichment (textarea, empty, input-group, field) + new pages (checkbox, label, select, switch) |
| [session-css-fixes.md](./session-css-fixes.md)                     | `@custom-variant` missing in theme.css, site ↔ CLI sync, preview off-center fix                     |
| [session-component-additions.md](./session-component-additions.md) | card, tooltip, dropdown-menu docs; toggle + toggle-group registry                                   |
| [session-lucide-migration.md](./session-lucide-migration.md)       | Full migration to `@phosphor-icons/react`, `IconComponent` rename                                   |
| [session-ai-port.md](./session-ai-port.md)                         | First-party chat engine at `lib/ai/` replacing external helper                                      |

## References

| File                         | What                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| [gotchas.md](./gotchas.md)   | Full detail of gotchas #1–25                                         |
| [patterns.md](./patterns.md) | MDX rich template, demo format, meta.json format, PowerShell recipes |

## How to use

1. Start with `../HANDOFF.md` — current state, active gotcha, workflow, rules.
2. Only open a file here if you need detail a `HANDOFF.md` pointer references.
3. When adding a new session, append a new `session-*.md` file, add it to the sessions table above, and add a one-line pointer in `HANDOFF.md` Archive Index.

## Adding a new archive file

Header template (paste at top):

```md
↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# <Title>

<One-line context>

---

<Content>
```
