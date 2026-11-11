# @frakment/react

React primitives for Frakment AI and chat interfaces.

[![npm](https://img.shields.io/npm/v/@frakment/react?style=for-the-badge&color=000)](https://www.npmjs.com/package/@frakment/react)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)

Shipped subpaths: `@frakment/react`, `@frakment/react/message-scroller`. Peer deps: `react >= 19`, `react-dom >= 19`.

## Install

```bash
npm install @frakment/react
```

Uses React 19 features and does not support React 18.

## Message Scroller

A headless scroll container for chat transcripts. It anchors turns, follows streamed replies, restores position on refresh, and tracks visibility of items.

```tsx
import { MessageScroller } from "@frakment/react/message-scroller";

export function Chat({ messages }) {
  return (
    <MessageScroller.Provider>
      <MessageScroller.Root>
        <MessageScroller.Viewport>
          <MessageScroller.Content>
            {messages.map((m) => (
              <MessageScroller.Item key={m.id} id={m.id}>
                {m.text}
              </MessageScroller.Item>
            ))}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
        <MessageScroller.Button direction="end">Jump to latest</MessageScroller.Button>
      </MessageScroller.Root>
    </MessageScroller.Provider>
  );
}
```

## Components

| Export | Purpose |
| :-- | :-- |
| `MessageScroller.Provider` | Owns shared scroll context. |
| `MessageScroller.Root` | Scroll root element with context. |
| `MessageScroller.Viewport` | Scrollable viewport. |
| `MessageScroller.Content` | Content wrapper expanding as messages arrive. |
| `MessageScroller.Item` | Individual message; must provide id for anchoring. |
| `MessageScroller.Button` | Scroll-to-anchor button with render-state. |

## Hooks

- `useMessageScroller()`: full context (scroll methods, anchor, follow-stream).
- `useMessageScrollerScrollable()`: start/end booleans.
- `useMessageScrollerVisibility()`: per-item visibility state.

## Why a separate package

Scroll behavior is complex: anchoring, streaming, restoring position, respecting user scroll intent, handling RTL. Putting it in npm means bug fixes ship without re-copying registry files. The Frakment registry message-scroller component is a styled wrapper around this package.

## Documentation

- Message scroller: https://www.arrafi.dev/frakment/docs/components/message-scroller
- React library: https://www.arrafi.dev/frakment/docs/libraries/react

## License

MIT licensed. See [LICENSE](./LICENSE).
