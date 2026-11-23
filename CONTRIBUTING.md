# Contributing to Frakment

Thanks for contributing. This guide covers the docs style, the changelog policy, and the review workflow.

## Scope

This repository is **product only**. Use whatever tooling you prefer -
AI assistants, editors, linters, local automation. We do not police your
stack. Pull requests are judged by their content, not by how they were
produced.

**Do not clutter the repo with non-product files.** Editor configuration,
local AI assistant instructions, personal notes, and temporary experiments
belong in your local environment or your fork.

## Package manager

The monorepo supports **npm** and **pnpm** equally for local development and CI. Use whichever you prefer.

### Install and build

```bash
# npm
npm ci
npm run build

# pnpm
pnpm install
pnpm build
```

Every workspace-aware script (`prebuild`, `precheck`, `predev`, `pretest`, `pretypecheck`, `release`) detects the active package manager through `scripts/workspaces.ts` and dispatches to either `npm run <script> --workspaces` or `pnpm -r`. You do not need to configure anything.

### Lockfiles

Only `package-lock.json` is committed. `pnpm-lock.yaml` is gitignored on purpose:

- **Single source of truth.** Two committed lockfiles drift apart when only one is regenerated. Dependency bumps, overrides, and engine constraints must match across both or contributors get inconsistent installs.
- **Deterministic CI.** CI resolves dependencies from `package-lock.json` only, so every job sees the same graph regardless of which PM a contributor uses locally.

If you use pnpm locally, `pnpm install` will create `pnpm-lock.yaml` in your working tree. Do not commit it. If you add a dependency, run `pnpm install` locally to install it, then `npm install` to update the committed `package-lock.json`, and commit only the npm lockfile change.

### Overrides and build approvals

pnpm 10+ reads two config blocks from `pnpm-workspace.yaml`, not from `package.json`:

- **`overrides`** — pins transitive dependencies (the same pins declared in `package.json#overrides` for npm). Without mirroring them into `pnpm-workspace.yaml`, pnpm silently resolves unpatched versions.
- **`allowBuilds`** — the map of packages allowed to run postinstall scripts (`esbuild`, `lefthook`, `ffmpeg-static`). pnpm 12 blocks postinstall by default.

When you change `package.json#overrides`, mirror the change into `pnpm-workspace.yaml#overrides`. When you add a dependency that needs to run a postinstall script, add it to `allowBuilds` and verify `pnpm install` exits clean.

### CI

Every PR runs CI checks for linting and formatting, typechecking, registry drift, theme drift, tests, and Gitleaks. Linting and formatting, typechecking, registry drift, and tests run with both npm and pnpm; theme drift and Gitleaks run once.

If `pnpm` CI fails, reproduce locally with:

```bash
pnpm install
pnpm build
pnpm run check
```

### Yarn and Bun

Not supported. The workspace helper and lockfile policy target npm and pnpm only. Do not add `yarn.lock` or `bun.lockb`.

## Ground rules

- **Shipped state only.** Docs describe what exists and works in the current `main`. No roadmap, no milestones, no "planned", no "in development", no "coming soon".
- **No internal detail.** Never mention build tooling, dev paths, temporary files, local servers, `node_modules`, or scratch notes in docs or changelog.
- **English only.** Docs and changelog are written in English. No mixed-language prose.
- **Accurate.** If a component is in the registry, its docs page has a working `<ComponentPreview>`. If it is not shipped, it is not documented.

## Code of Conduct

Be respectful, civil, and professional. Harassment, discrimination, and personal attacks are not tolerated. This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

Report unacceptable behavior to the maintainer via the private channel in [SECURITY.md](./SECURITY.md). Reports are handled confidentially.

## Reporting bugs

Open an issue using the **Bug report** template. Before filing:

- **Search existing issues** and discussions for the same problem.
- **Upgrade to the latest version** - `npx frakment@latest add <name> --overwrite` replaces the file with the newest registry source.
- **Reduce to a minimal reproduction** - one component plus the props that trigger the bug.

A bug report includes:

- **Expected** vs **actual** behaviour, in one sentence each.
- **Steps to reproduce** - one to three numbered steps.
- **Component and version** - e.g. `button@0.1.0`. Run `npm view frakment version`.
- **Environment** - React, Tailwind, Node versions; OS; browser.
- **Minimal code** - a fenced `tsx` block with only the props and children that matter.

Issues filed without the template are closed with a one-line reply asking for it. The template exists so the fix lands in one pass instead of five.

## Requesting features

Open an issue with the **Feature request** template, or start a [Discussion](https://github.com/frakment/ui/discussions) if you are unsure whether the feature belongs in Frakment.

A feature request includes:

- **The problem** - what you are trying to build and where the current API falls short.
- **The proposal** - what the new prop, component, or behaviour would look like. Sketch the JSX.
- **Alternatives** - what you tried instead, and why it did not fit.
- **Scope** - new primitive, variant of an existing one, or composed module?

Features that do not fit Frakment:

- Opinionated brand colors - use the monochrome tokens and a theme.
- Multi-page routing - use Next.js, Remix, or React Router.
- Payment, auth, or backend logic - build on top of the primitives.

## Questions

For how-to questions ("how do I use X with Y?"), open a [GitHub Discussion](https://github.com/frakment/ui/discussions). Issues are for actionable bugs and features; discussions are for open-ended answers.

For security issues, do **not** open a public issue. See [SECURITY.md](./SECURITY.md) for the private reporting process.

## Docs style

Rich but simple. One sentence per paragraph. Every component page follows the same shape.

### ComponentPreview pattern

Every component page follows the same preview pattern:

- **Hero** (top of page): `<ComponentPreview name="<component>" title="<component>.tsx">` — no `src` prop. The Code tab shows the registry source (`apps/web/registry/<component>.tsx`).
- **Every other preview**: `<ComponentPreview name="<slug>" title="<slug>.tsx" src="examples/<slug>.tsx">` — the Code tab shows the demo file, not the registry.

The registry source appears **once** per page (hero). Every other preview's Code tab must show usage, not implementation. `name` without `src` falls back to registry source; use it only for the hero.

Demo files live at `apps/web/examples/<slug>.tsx` and export a named component (`<Slug>`). Import them in the MDX and pass as children.

### Component naming

- **Lowercase in prose.** Write "a button", "the badge", "spinners" — not "a Button" or "the Badge".
- **Title Case only in headings, the first word of a sentence, or a bold reference.** `## Accordion`, "Button renders a `<button>`", "**TraceIcon** is `aria-hidden`".
- **Never drop articles.** "A badge is a single-part component" stays grammatical; "Badge is a single-part component" does not.
- **Code identifiers keep their exact case.** `<Button>`, `<Badge>`, `<AccordionTrigger>` always match the export name.
- **One rule per sentence.** If a sentence switches between lowercase reference and code identifier, keep both consistent with this section.

### Template

````mdx
---
title: "<Component Name>"
description: "<One sentence: what it does and when to use it.>"
---

import { XDemo } from "@/examples/x-demo";

<Two to three sentences: what it is and what problem it solves.>

## Installation

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">Command</TabsTrigger>
    <TabsTrigger value="manual">Manual</TabsTrigger>
  </TabsList>

<TabsContent value="cli">

```bash
npx frakment add x
```

</TabsContent>

<TabsContent value="manual">
  <Steps className="mb-0 pt-2">
    <Step>Install the dependencies:</Step>

    ```bash
    npm install <deps>
    ```

    <Step>Copy the code into your project:</Step>

    <ComponentSource name="x" title="components/ui/x.tsx" />

    <Step>Update the import paths.</Step>
  </Steps>
</TabsContent>
</CodeTabs>

## Usage

<ComponentPreview name="x" title="x-demo.tsx" src="examples/x-demo.tsx" previewClassName="h-auto py-8">
  <XDemo />
</ComponentPreview>

```tsx title="x.tsx"
import { X } from "@/components/ui/x";
```

```tsx title="x.tsx"
<X prop="value" />
```

## Anatomy

```tsx
<X>
  <XPart />
</X>
```

- **X** - short description
- **XPart** - short description

## API Reference

<PropsTable
  rows={[
    { name: "variant", type: "a | b", defaultValue: "a", description: "Visual variant." },
  ]}
/>

## Accessibility

- ARIA roles exposed
- Keyboard interactions supported
- Consumer responsibilities
````

### Reference

`apps/web/content/docs/components/web/button.mdx` is the reference implementation. Copy its structure, not its content.

### Rules

| Do                                | Do not                    |
| --------------------------------- | ------------------------- |
| One sentence per paragraph        | Wall of text              |
| Live `<ComponentPreview>`         | Screenshot or placeholder |
| `<Steps>` for installation        | Inline bash mid-paragraph |
| `## Usage` with a minimal example | Full demo source          |
| Link related components           | Duplicate another page    |

## Changelog policy

Changelog entries exist **only** for library and package changes that affect users.

| Change                                        | Changelog? |
| --------------------------------------------- | ---------- |
| New registry component                        | Yes        |
| Component visual or behaviour change          | Yes        |
| Public API change (props, exports)            | Yes        |
| CLI command or flag change                    | Yes        |
| Theme token change in `theme.css`             | Yes        |
| Registry schema change                        | Yes        |
| Package rename or publish                     | Yes        |
| Site-only change (header, sidebar, demo page) | No         |
| Docs typo, refactor, or wording               | No         |
| Internal tooling, CI, or dev scripts          | No         |

### Template

````mdx
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
````

### Rules

- **Preview first.** For visual changes, place `<ComponentPreview>` above the prose so readers see the result before the description.
- **Code diff for non-visual sections.** CLI flags, config keys, and dependency fixes use a fenced code block, not a preview.
- **One file per day.** Name is `YYYY-MM-DD.mdx`. Immutable after merge.
- **No internal detail.** No dependency bumps without a user-visible effect, no `package.json` diffs, no CI notes, no roadmap language.

**Before merging a Changesets release pull request**, verify every changeset description matches the final shipped state:

- Every file the changeset mentions still exists.
- Every feature the changeset names is observable by a user of the published package.
- No reference to files that were removed or merged into another file.
- No reference to parser internals or tokens that no shipped component consumes.

## Workflow

1. Branch from `main`.
2. Run `npm ci`.
3. Make your change. Adding a component? See [Adding a new component](#adding-a-new-component). If you change a user-facing package, update the changelog.
4. Run `npm run fix`, `npm run check`, `npm run typecheck`, `npm test`.
5. Sign off your commits with `git commit -s` (see [Sign-off](#sign-off-dco) below).
6. Open a pull request. Required checks must pass before merge.

## Commit messages

Every commit follows [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook rejects messages that do not match the pattern.

Format:

```
<type>(<scope>)!: <subject>

<body>

<footer>
```

Types:

| Type       | Use for                                    |
| :--------- | :----------------------------------------- |
| `feat`     | New component, new prop, new CLI command   |
| `fix`      | Bug fix in a component, CLI, or build      |
| `docs`     | README, CONTRIBUTING, docs page, changelog |
| `style`    | Formatting, no behaviour change            |
| `refactor` | Restructure without behaviour change       |
| `perf`     | Performance improvement                    |
| `test`     | Add or fix tests                           |
| `build`    | Build config, package.json, tsconfig       |
| `ci`       | GitHub Actions, release workflow           |
| `revert`   | Revert a previous commit                   |
| `chore`    | Version bump, dependency bump              |

Rules:

- **Lowercase type**, no period at the end of the subject.
- **Imperative mood** - `add badge variant`, not `added` or `adds`.
- **Scope optional**, use the component or package name - `feat(button):`, `fix(cli):`.
- **`!` after type or scope** marks a breaking change - `feat(animation)!: rename constants`.
- **Body explains why**, not what. The diff shows what.
- **`Signed-off-by`** trailer required (see [Sign-off](#sign-off-dco)).

Examples:

- `feat(credit-card): add masked prop with staggered morph`
- `fix(cli): reject path traversal in add command`
- `docs: modernize docs template in CONTRIBUTING`
- `chore(deps): bump motion to 14.10.0`
- `feat(animation)!: rename constants to camelCase`

## Sign-off (DCO)

Every commit must be signed off with the Developer Certificate of Origin (DCO). Add `-s` to your commit command:

```bash
git commit -s -m "docs: fix typo in theming page"
```

This adds a `Signed-off-by: Your Name <email>` line to the commit message. It certifies you have the right to submit the contribution under this project's license. See [DCO.txt](./docs/legal/DCO.txt) for the full text.

Commits without a valid `Signed-off-by` line fail the DCO check in CI and cannot be merged. Amend existing commits with `git commit --amend -s` (last commit) or `git rebase -i --signoff main` (multiple commits).

## Regenerate README assets

The README hero image and OG preview are generated from the live site, not uploaded manually.

```bash
npm run assets:generate
```

Requires Playwright Chromium. Install once:

```bash
npx playwright install chromium
```

What it generates:

- `apps/web/assets/hero-dark.webp` — homepage screenshot, 8K (7680×4320), dark mode
- `apps/web/assets/og.png` — social preview, 1200×630, dark mode

Run this whenever the homepage layout, hero copy, or theme changes. Commit both files together with the change.

## Review checklist

- [ ] Docs page follows the template above.
- [ ] `<ComponentPreview>` renders a working demo.
- [ ] Changelog entry exists if the change is user-facing in a package.
- [ ] No internal detail (paths, tooling, roadmap, temporary files).
- [ ] Commit contains only product content - nothing that would clutter the repo for end users browsing the source.
- [ ] All checks pass.

## Adding a new component

Follow every step. The component can install via the CLI and compile fine, yet stay invisible in the docs, sidebar, or changelog if a later step is missed. Three of those steps fail silently.

### 1. Component source

Two files, identical content:

- `apps/web/registry/<name>.tsx` - ships via `npx frakment add <name>`
- `apps/web/components/ui/<name>.tsx` - mirror for local dev and examples

Keep them identical. `npm run registry:audit` fails if they diverge.

### 2. Registry entry

Add to `apps/web/frakment.json` under `components`:

```json
{
  "name": "<name>",
  "title": "Component Name",
  "description": "One sentence.",
  "source": "registry/<name>.tsx",
  "target": "components/ui/<name>.tsx",
  "dependencies": ["class-variance-authority@^0.7.1"],
  "registryDependencies": ["button"],
  "type": "registry:ui"
}
```
`dependencies` must match every external import. `registryDependencies` must match every `@/components/ui/<other>` import. Missing dep = broken install. Extra dep = unnecessary install.

### 3. Examples

Create `apps/web/examples/<name>-demo.tsx` with `"use client"` at the top. Add variants as separate files when useful.

Rules:

- Always `"use client"` if the demo uses state, events, or hooks
- Icons from `@/lib/icons`, not directly from `@phosphor-icons/react`
- Hardcoded props (demos are showcase, not tests)
- Root wrapper: `max-w-xs` for inputs, `max-w-sm` for forms, `max-w-md` for rich layouts

### 4. Docs page

Create `apps/web/content/docs/{category}/<name>.mdx`. Template: see [Docs style](#docs-style) above. Reference:

- Simple: `apps/web/content/docs/components/web/button.mdx`
- Composed: `apps/web/content/docs/composites/login-form.mdx`
- Utility: `apps/web/content/docs/utilities/shimmer.mdx`

The `<ComponentPreview>` `src` prop must point at the example file. Without it, the Code tab shows the component source instead of the usage example.

### 5. Sidebar and mobile nav

Add `"<name>"` to `apps/web/content/docs/{category}/meta.json` under `pages`, alphabetically. Without this the page exists at its URL but is not linked from the sidebar, mobile nav, or command menu.

### 6. New badge

Add `"/docs/{category}/<name>"` to `pagesNew` in `apps/web/lib/docs.ts`. This drives the blue dot in the sidebar, mobile nav, command menu, and component list grid.

`pagesNew` is a rotating set of the components shipped on the current working day, not a cumulative list. A new calendar day of shipped work starts a new batch: replace the entire set with only the components shipped that day. Components from previous days graduate and their dots disappear.

### 7. Changelog

Create the dated MDX entry in `apps/web/content/docs/changelog/`, using `YYYY-MM-DD.mdx` as the filename. Template: see [Changelog policy](#changelog-policy) above. Add the date to `apps/web/content/docs/changelog/meta.json` under `pages`, newest first. One file per day, immutable after merge.

### 8. Build

Run in this order:

```bash
npm run registry:build
npm run fix
npm run check
npm run typecheck
npm test
npm run build
```
`registry:build` regenerates `public/r/<name>.json`. Without it, `npx frakment add <name>` returns 404 for users even though the component works locally.

### 9. Silent failure checklist

| Missing                                           | Symptom                                                                                           |
| :------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| `apps/web/frakment.json` entry                    | CLI returns 404                                                                                   |
| Category navigation metadata contains the entry   | Page not in sidebar, mobile nav, or command menu                                                  |
| `pagesNew` entry in `apps/web/lib/docs.ts`        | Page linked everywhere, no new badge in sidebar, mobile nav, command menu, or component list grid |
| `apps/web/content/docs/changelog/meta.json` entry | Release missing from changelog                                                                    |
| `npm run registry:build` not run                  | `apps/web/public/r/<name>.json` missing                                                           |

### PR checklist

- [ ] `apps/web/registry/<name>.tsx` and `apps/web/components/ui/<name>.tsx` are identical
- [ ] `apps/web/frakment.json` entry has correct deps
- [ ] `apps/web/examples/<name>-demo.tsx` exists and renders
- [ ] Docs page follows [Docs style](#docs-style)
- [ ] Category navigation metadata has the entry
- [ ] `pagesNew` has the entry (drives blue dot in sidebar, mobile nav, command menu, component list grid)
- [ ] Changelog file exists + `apps/web/content/docs/changelog/meta.json` has the entry
- [ ] `npm run registry:build` ran and `apps/web/public/r/<name>.json` is in the diff
- [ ] `npm run build` passes
- [ ] Commit signed off (`git commit -s`)

## Adding a new docs section

Sections come from two sources: manual groups in `sectionGroups` (in `apps/web/lib/docs.ts`) and auto-discovered folders from the page tree. Add manual sections to `sectionGroups`, then register the folder in `apps/web/content/docs/meta.json` and the route in `apps/web/config/routes.ts`. Auto-discovered folders need only steps 1-3 below.

The sidebar, mobile nav, and command menu all call `buildNavGroups(tree)` from `apps/web/lib/docs.ts`. Update `sectionGroups` and `excludedSections` there. Never render nav items directly in consumer files.

Steps:

1. Create `apps/web/content/docs/<slug>/index.mdx` with frontmatter (`title`, `description`).
2. Create `apps/web/content/docs/<slug>/meta.json` with `{ "title": "<Display Name>" }`.
3. Add `"<slug>"` to `apps/web/content/docs/meta.json` `pages` at the desired position.
4. Add `docsSlug: "/docs/<slug>"` to `apps/web/config/routes.ts`.
5. If manually grouped, add `{ label: "<Group>", sections: [{ href: routes.docsSlug, name: "<Display Name>" }] }` to `sectionGroups` in `apps/web/lib/docs.ts`. Auto-discovered folders need no `sectionGroups` entry.
6. Run `npm run build` to verify.
