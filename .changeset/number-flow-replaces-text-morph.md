---
"frakment": major
---

Replace `text-morph` with `number-flow`.

`text-morph` is removed from the registry. The replacement is `number-flow`, a numeric slot machine built on `Intl.NumberFormat`. The `@number-flow/react` dependency is dropped — `number-flow` has no runtime dependencies.

Projects using `text-morph` from a previous install keep the old file. New installs use `npx frakment add number-flow`.

Text cycling that previously used `text-morph` (e.g. the package manager switcher) now uses inline motion.
