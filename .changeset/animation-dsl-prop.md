---
"frakment": minor
---

Add an `animation` prop to Accordion, Collapsible, Trace, Credit Card, and Text Morph. Accepts a string DSL: named easings (`"easeInOut"`, `"easeOutExpo"`), `"cubic-bezier(...)"`, `"spring(stiffness, damping)"`, `"inertia(power, timeConstant)"`, `"keyframes([values], [times]?)"`, plus `delay(...)` and `repeat(...)` options. Pass `animation={false}` to disable. Credit Card applies the transition per character. Text Morph overrides its `transition` prop when `animation` is set. Parsed by `lib/motion-dsl.ts`, scaffolded by `frakment init`.

