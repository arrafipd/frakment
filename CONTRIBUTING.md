# Contributing to Frakment

Thanks for contributing. This guide covers the docs style, the changelog policy, and the review workflow.

## Ground rules

- **Shipped state only.** Docs describe what exists and works in the current `main`. No roadmap, no milestones, no "planned", no "in development", no "coming soon".
- **No internal detail.** Never mention build tooling, dev paths, temporary files, local servers, `node_modules`, or scratch notes in docs or changelog.
- **English only.** Docs and changelog are written in English. No mixed-language prose.
- **Accurate.** If a component is in the registry, its docs page has a working `<ComponentPreview>`. If it is not shipped, it is not documented.

## Docs style

Rich but simple. One sentence per paragraph. Every component page follows the same shape.

### Template

```mdx
---
title: "<Component Name>"
description: "<One sentence: what it does and when to use it.>"
---

import { XDemo } from "@/examples/x-demo";

<Two to three sentences: what it is and what problem it solves.>

## Installation

<Steps>
  <Step>Install</Step>

```bash
npx frakment@latest add x
```

  <Step>Import</Step>

```tsx
import { X } from "@/components/ui/x";
```
</Steps>

## Usage

<ComponentPreview name="x" title="x.tsx">
  <XDemo />
</ComponentPreview>

```tsx
<X prop="value" />
```

## API

<PropsTable rows={[...]} />
```

### Reference

`content/docs/components/button.mdx` is the reference implementation. Copy its structure, not its content.

### Rules

| Do | Do not |
| --- | --- |
| One sentence per paragraph | Wall of text |
| Live `<ComponentPreview>` | Screenshot or placeholder |
| `<Steps>` for installation | Inline bash mid-paragraph |
| `## Usage` with a minimal example | Full demo source |
| Link related components | Duplicate another page |

## Changelog policy

Changelog entries exist **only** for library and package changes that affect users.

| Change | Changelog? |
| --- | --- |
| New registry component | Yes |
| Component visual or behaviour change | Yes |
| Public API change (props, exports) | Yes |
| CLI command or flag change | Yes |
| Theme token change in `theme.css` | Yes |
| Registry schema change | Yes |
| Package rename or publish | Yes |
| Site-only change (header, sidebar, demo page) | No |
| Docs typo, refactor, or wording | No |
| Internal tooling, CI, or dev scripts | No |

### Template

```mdx
---
title: "Month DD, YYYY"
description: "<One sentence: what shipped.>"
date: "YYYY-MM-DD"
---

import { XDemo } from "@/examples/x-demo";

<One paragraph: the change and why it matters.>

- [X](#x): One line.
- [Y](#y): One line.

<hr className="my-16 border-border/40" />

### X

<ComponentPreview name="x" title="x.tsx">
  <XDemo />
</ComponentPreview>

<One paragraph describing the component or change.>

#### Installation

<Steps>
  <Step>Install</Step>

```bash
npx frakment@latest add x
```
</Steps>

#### Minimal usage

```tsx
<X />
```
```

### Rules

- **Preview first.** For visual changes, place `<ComponentPreview>` above the prose so readers see the result before the description.
- **Code diff for non-visual sections.** CLI flags, config keys, and dependency fixes use a fenced code block, not a preview.
- **One file per day.** Name is `YYYY-MM-DD.mdx`. Immutable after merge.
- **No internal detail.** No dependency bumps without a user-visible effect, no `package.json` diffs, no CI notes, no roadmap language.

## Workflow

1. Branch from `main`.
2. Run `npm ci`.
3. Make your change. If it ships a component or changes a user-facing package, update the changelog.
4. Run `npm run fix`, `npm run check`, `npm run typecheck`, `npm test`.
5. Open a pull request. Required checks must pass before merge.

## Review checklist

- [ ] Docs page follows the template above.
- [ ] `<ComponentPreview>` renders a working demo.
- [ ] Changelog entry exists if the change is user-facing in a package.
- [ ] No internal detail (paths, tooling, roadmap, temporary files).
- [ ] No mentions of internal AI tooling, admin notes, or scratch files.
- [ ] All checks pass.
