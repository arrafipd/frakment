# Governance

Frakment is currently maintained by a single maintainer. This document describes how decisions are made today and what will change if the project gains co-maintainers.

## Maintainer

**[@arrafipd](https://github.com/arrafipd)** owns the repository, publishes npm packages, and holds release credentials.

## Decision making

- **Day-to-day changes** (bug fixes, docs, component tweaks) — merged by the maintainer after CI passes.
- **Public API changes** (prop additions, breaking changes) — announced in a changelog entry and a changeset before merge.
- **Registry schema, release workflow, security policy** — require maintainer review; see [CODEOWNERS](./.github/CODEOWNERS).
- **Disagreements** — resolved by discussion in the relevant issue or PR. If consensus cannot be reached, the maintainer makes the final call and documents the reasoning in the PR.

## Becoming a maintainer

No formal process yet. The maintainer may invite regular contributors to co-maintain after a track record of quality PRs, reviews, and issue triage. Invitations are announced in a GitHub Discussion.

## Changes to this document

Proposed via PR. The maintainer merges when the change reflects reality, not aspiration.
