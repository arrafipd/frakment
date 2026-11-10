---
"@frakment/ai": patch
---

Fix the README quick-start to use the actual `createChat().user().assistant().transport()` chain instead of the non-existent `chat.send()`. Declare `engines.node: ">=22.12.0"` to match the CLI requirement.
