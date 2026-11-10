---
"frakment": minor
---

Add an `animation` prop to Accordion (root and `AccordionContent`). Accepts a string DSL: named easings (`"easeInOut"`, `"easeOutExpo"`), `"cubic-bezier(...)"`, `"spring(stiffness, damping)"`, `"inertia(power, timeConstant)"`, `"keyframes([values], [times]?)"`, plus `delay(...)` and `repeat(...)` options. Pass `animation={false}` to disable. Parsed by `lib/motion-dsl.ts`, scaffolded by `frakment init`.

