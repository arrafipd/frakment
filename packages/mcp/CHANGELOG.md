# @frakment/mcp

## 1.0.1

### Patch Changes

- e9f81fa: Build the published binaries as JavaScript before packing so Node.js can run them from `node_modules`, and point the CLI's shipped registry configuration at the canonical Frakment URL.

## 1.0.0

### Major Changes

- a17a0aa: Require Node.js 22.18.0 or newer to run TypeScript entry points directly.

### Patch Changes

- 762b982: Align the public registry catalog and MCP scenario compositions with the current component set.

## 0.0.4

### Patch Changes

- 9d65b1d: Tighten `engines.node` to `>=22.12.0` to match the CLI. Fix the default `FRAKMENT_REGISTRY` URL in the README to point at `https://www.arrafi.dev/frakment`.

## 0.0.3

### Patch Changes

- 8e4a9bb: Switch to MIT license. Include LICENSE file in published package. Update package.json license field from "SEE LICENSE IN LICENSE" to "MIT".
