# @frakment/ai

First-party deterministic chat engine for Frakment AI interfaces.

[![npm](https://img.shields.io/npm/v/@frakment/ai?style=for-the-badge&color=000)](https://www.npmjs.com/package/@frakment/ai)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)

The engine powers the chat and agent primitives in the Frakment registry (message-animated, trace, chain-of-thought). It wraps the Vercel AI SDK with a deterministic event contract so UI components can render stable, replayable state.

## Install

```bash
npm install @frakment/ai ai
```

Or with your package manager of choice:

```bash
pnpm add @frakment/ai ai
yarn add @frakment/ai ai
bun add @frakment/ai ai
```

Peer dependency: ai >= 7.

## Quick start

```ts
import { createChat } from "@frakment/ai";

// Build a deterministic transcript.
const chat = createChat()
  .user("Hello")
  .assistant("Hi! How can I help?")
  .user("Show me a trace.");

// Read turns back.
const messages = chat.get();
const last = messages.at(-1);

// Hand the transport to any AI SDK consumer.
const transport = chat.transport();
// In React: useChat({ transport }) picks up sendMessages automatically.
// Outside React: await transport.sendMessages({ messages, abortSignal });
```

## Public API

- `createChat(options?)` -> `AiSdkChat`. Factory for a deterministic chat instance.
- `getMessageText(message)` -> concatenated text parts of a `UIMessage`.
- `createAiSdkAdapter()` -> adapter bridging AI SDK transport shapes.
- `getToolCalls(message)` -> pending tool calls from a message.

All event types (`ChatEvent`, `ChatEventEnvelope`, `UIMessageChunk`, `ToolHandle`, ...) are exported for consumers that build custom renderers.

## Used by

- `message-animated` imports `getMessageText` from this package.
- Other AI primitives (`bubble`, `message`, `message-scroller`, `trace`, `chain-of-thought`, `plan`, `reasoning`, `tool`, `subagent`) are independent and do not depend on this package.

## Documentation

- Engine guide: https://www.arrafi.dev/frakment/docs/libraries/ai
- Registry: https://www.arrafi.dev/frakment/docs/ai-elements

## License

MIT licensed. See [LICENSE](./LICENSE).
