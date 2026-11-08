# @frakment/ai

First-party deterministic chat engine for Frakment AI interfaces.

[![npm](https://img.shields.io/npm/v/@frakment/ai?style=for-the-badge&color=000)](https://www.npmjs.com/package/@frakment/ai)
[![License](https://img.shields.io/badge/license-source--available-blue?style=for-the-badge)](./LICENSE)

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

const chat = createChat();

const stream = chat.send({
  messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] }],
  transport: {
    async run({ messages, abortSignal }) {
      return fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
        signal: abortSignal,
      }).body!;
    },
  },
});

for await (const event of stream) {
  if (event.type === "text-delta") process.stdout.write(event.delta);
}
```

## Public API

- `createChat(options?)` -> `AiSdkChat`. Factory for a deterministic chat instance.
- `getMessageText(message)` -> concatenated text parts of a `UIMessage`.
- `createAiSdkAdapter()` -> adapter bridging AI SDK transport shapes.
- `getToolCalls(message)` -> pending tool calls from a message.

All event types (`ChatEvent`, `ChatEventEnvelope`, `UIMessageChunk`, `ToolHandle`, ...) are exported for consumers that build custom renderers.

## Used by

- Chat primitives: `message-animated`, `bubble`, `message`, `message-scroller`.
- Agent primitives: `trace`, `chain-of-thought`, `plan`, `reasoning`, `tool`, `subagent`.

## Documentation

- Engine guide: https://www.arrafi.dev/frakment/docs/libraries/ai
- Registry: https://www.arrafi.dev/frakment/docs/ai-elements

## License

Source-available. Free for personal and educational use. Commercial use requires at least one merged pull request to https://github.com/arrafipd/frakment. See [LICENSE](./LICENSE).
