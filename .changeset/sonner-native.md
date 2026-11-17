---
"frakment": major
---

**Sonner is now a native toast engine.**

The `sonner` registry component no longer depends on the `sonner` npm package. The toast state machine, engine, animations, and CSS ship inside `registry/sonner.tsx`. `toast` and `Toaster` are both exported from `@/components/ui/sonner`.

- **Breaking**: `import { toast } from "sonner"` no longer resolves. Use `import { toast } from "@/components/ui/sonner"` instead. The `npx frakment add sonner` command still works; only the import path changes.
- **Fixed**: `frakment.json` now declares `spinner` as a `registryDependency`. Installs previously missed `@/components/ui/spinner` and broke at runtime.
- **Renamed**: Display name and docs path change from "Toast" to "Sonner".
- **Fixed**: Component list grid now renders the blue dot for new components. Sidebar, mobile nav, and command menu already had it. Docs URL is `/docs/components/web/sonner` (redirect from `/docs/components/sonner`). Demo files renamed `toast-*` → `sonner-*`, exports renamed `Toast*` → `Sonner*`.

The rendered UI, icons, themes, and toast behavior are byte-for-byte unchanged.
