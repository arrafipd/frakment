---
"frakment": major
---

Message consolidation. Message, Bubble, MessageScroller, and MessageAnimated now ship as a single `message` registry component. `npx frakment add message` installs everything: layout primitives, bubble with seven variants, the scroll engine, and the animated message renderer. `bubble`, `message-scroller`, and `message-animated` are no longer installable by name. `@frakment/react` is deprecated: its `message-scroller` engine is inlined into the `message` registry file. Migrate `import ... from "@frakment/react/message-scroller"` to `@/components/ui/message` after running `npx frakment@latest add message`. The `BubbleContent` `asChild` prop is replaced by `as`. Removes `radix-ui` and `ai` runtime dependencies from the consolidated component.
