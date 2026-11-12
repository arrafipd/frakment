---
"frakment": minor
---

Button: replace `asChild` with an `href` prop.

Pass `href` to render the button as a native anchor. `<Button href="/docs">Read the docs</Button>` produces a link without a wrapper. For client-side navigation with Next.js, React Router, or TanStack Router, apply the button styles with `buttonVariants` and render the router link component.

The `button` registry entry no longer depends on `radix-ui`. Fresh installs of `npx frakment add button` pull only `class-variance-authority`.
