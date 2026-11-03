↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Session — First-Party Chat Engine (lib/ai)

Replaced external chat helper with first-party engine at lib/ai/ (11 modules). Contract-complete. Package uninstalled.

---

### SESSION_PLAN: full `@shadcn/helpers` port — internal rewrite (zero shadcn engine)

**Tujuan:** `@shadcn/helpers` digantikan engine sendiri, behavior 100% match dengan original. Semua fitur di-port: turn scripting, continuation, tools, approvals, files, sources, fallback, ChatTransport.

**Scope penuh (bukan minimal):** semua API di `chat-ChArRzRi.d.ts` + `ai-sdk/index.js` + `chunk-ZEGKA56A.js`.

**Bukan scope:** `@shadcn/react` (message-scroller engine) — sesi terpisah setelah helpers selesai.

**Arsitektur:**

- `lib/ai.ts` — public API entry (createChat, getMessageText). Import path tidak berubah.
- `lib/ai/types.ts` — Chat, ChatOptions, EventWriter, ToolHandle, Turn, ChatEvent, ChatEventEnvelope
- `lib/ai/ids.ts` — createIdGenerator
- `lib/ai/utils.ts` — sleep (abortable), splitWords, deepClone, warn, stripDataPrefix
- `lib/ai/payloads.ts` — file, reasoningFile, sourceUrl, sourceDocument, custom
- `lib/ai/envelope.ts` — envelope builders, encodeChunk, materializeParts, eventsFromParts
- `lib/ai/stream.ts` — streamFromEnvelope (ReadableStream<UIMessageChunk>)
- `lib/ai/writer.ts` — EventWriter + ToolHandle (fluent DSL)
- `lib/ai/builder.ts` — ChatBuilder class (chainable)
- `lib/ai/transport.ts` — buildTransport (sendMessages + reconnectToStream)
- `lib/ai/adapter.ts` — FrameworkAdapter (AI SDK v7: encodeChunk target)

**Phase plan (per-phase: commit + push + HANDOFF update):**

| Phase | File                                                     | Status |
| ----- | -------------------------------------------------------- | ------ |
| -1    | HANDOFF plan                                             | ⏳     |
| 0     | `lib/ai/types.ts`                                        | ⏳     |
| 1     | `ids.ts` + `utils.ts` + `payloads.ts`                    | ⏳     |
| 2     | `envelope.ts` + `stream.ts`                              | ⏳     |
| 3     | `writer.ts`                                              | ⏳     |
| 4     | `builder.ts` core (user/assistant/error/sleep/get/next)  | ⏳     |
| 5     | `builder.ts` continuation (callback, tools, approvals)   | ⏳     |
| 6     | `transport.ts`                                           | ⏳     |
| 7     | `adapter.ts`                                             | ⏳     |
| 8     | `lib/ai/index.ts` + `lib/ai.ts` re-export + build verify | ⏳     |
| 9     | Test parity 3 demo + uninstall `@shadcn/helpers`         | ⏳     |
| 10    | HANDOFF final                                            | ⏳     |

**Reference source (baca dari sini kalau sesi baru):**

- `node_modules/@shadcn/helpers/dist/chat-ChArRzRi.d.ts` — semua types
- `node_modules/@shadcn/helpers/dist/ai-sdk/index.js` — adapter AI SDK v7
- `node_modules/@shadcn/helpers/dist/chunk-ZEGKA56A.js` — builder + utilities

**Resume instruction:** kalau sesi baru, baca bagian ini + cek status table. Phase ⏳ belum selesai, ✅ selesai + commit hash. Lanjut dari phase pertama yang ⏳.

**Gotcha relevan:**

- #18: PowerShell single-quote tidak interpret backtick. Pakai array literal + WriteAllLines.
- #23: `detectImports` regex catch `from "X"` di komentar. Hindari pattern di komentar source.
