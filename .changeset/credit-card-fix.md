---
"frakment": patch
---

Fix `credit-card`: `CreditCardIssuer` no longer imports the site-internal `@/components/brand`. Pass a `logo` or `children` to render a mark; omitting both renders nothing. Fresh installs no longer fail with a module-not-found error.
