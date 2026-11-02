// Port of @shadcn/helpers ChatBuilder core (chunk-ZEGKA56A.js `ce()` function).
// Phase 4: user/assistant/error/sleep/get/next. Phase 5 extends continuation, Phase 6 transport.

import { materializeParts, eventsFromParts } from "./envelope";
import { createIdGenerator } from "./ids";
import { createPayloadFactory } from "./payloads";
import type {
  Chat,
  ChatAssistantOptions,
  ChatEvent,
  ChatTransport,
  ChatTransportOptions,
  AiSdkChat,
  ChatUserOptions,
  CreateChatOptions,
  DataTypes,
  EventWriter,
  ToolSet,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from "./types";
import { deepClone } from "./utils";
import { createEventWriter, DEFAULT_ERROR, DEFAULT_TEXT } from "./writer";
import type { WriterContext } from "./writer";

export const DEFAULT_USER_TEXT = "Summarize the uploaded receipt.";

export interface Turn {
  role: "user" | "assistant";
  messageId: string;
  events: ChatEvent[];
  message?: UIMessage;
  metadata?: unknown;
  continuation?: boolean;
  lastEvents?: ChatEvent[];
  resolve?: unknown;
}

export type MessageFactory = (input: {
  id: string;
  role: "user" | "assistant";
  metadata: unknown;
  parts: UIMessagePart<UIDataTypes, UITools>[];
}) => UIMessage;

export function defaultCreateMessage(input: {
  id: string;
  role: "user" | "assistant";
  metadata: unknown;
  parts: UIMessagePart<UIDataTypes, UITools>[];
}): UIMessage {
  if (input.role === "user") {
    const parts = input.parts.map((part) => {
      if (part.type !== "text") {
        return part;
      }
      const { state: _ignored, ...rest } = part as UIMessagePart<
        UIDataTypes,
        UITools
      > & { state?: unknown };
      return rest as UIMessagePart<UIDataTypes, UITools>;
    });
    return { id: input.id, role: "user", metadata: input.metadata, parts };
  }
  return {
    id: input.id,
    role: "assistant",
    metadata: input.metadata,
    parts: input.parts,
  };
}

export function createMetadataFactory(
  now?: Date | string
): () => Record<string, unknown> {
  const date =
    now instanceof Date ? now : new Date(now ?? "2026-01-01T00:00:00.000Z");
  return () => ({ createdAt: date.toISOString() });
}

// ============================================================
// createChatBuilder — core methods (Phase 4)
// Transport + continuation will be added in Phase 5/6.
// ============================================================

function getTextOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function createChatBuilder(options: CreateChatOptions = {}): AiSdkChat {
  const ids = createIdGenerator(options);
  const payloads = createPayloadFactory(ids);
  const createMetadata = createMetadataFactory(options.now);
  const writerContext: WriterContext = { ids, payloads };

  const turns: Turn[] = [];
  const pendingSleeps: ChatEvent[] = [];

  function reserveFromEvents(events: ChatEvent[]): void {
    for (const event of events) {
      if (
        event.kind === "tool-input" ||
        event.kind === "tool-output" ||
        event.kind === "tool-error" ||
        event.kind === "tool-denied" ||
        event.kind === "tool-approval-request"
      ) {
        ids.reserveToolCallId(event.toolCallId);
      }
      if (event.kind === "tool-approval-request") {
        ids.reserveApprovalId(event.approvalId);
      }
      if (event.kind === "source-url" || event.kind === "source-document") {
        ids.reserveSourceId(event.part.sourceId);
      }
    }
  }

  function nextMessageIdOrReserve(id?: string): string {
    if (id !== undefined) {
      ids.reserveMessageId(id);
      return id;
    }
    return ids.nextMessageId();
  }

  function flushPendingSleeps(): ChatEvent[] {
    const sleeps = pendingSleeps.splice(0);
    return [...sleeps];
  }

  function pushTurn(turn: Turn): AiSdkChat {
    turns.push(turn);
    return builder;
  }

  function matchTranscript(messages: readonly UIMessage[]): number {
    const transcriptIds = new Set(messages.map((m) => m.id));
    let lastMatch = -1;
    for (let i = 0; i < turns.length; i += 1) {
      const turn = turns[i];
      if (turn && transcriptIds.has(turn.messageId)) {
        lastMatch = i;
      }
    }
    if (lastMatch === -1) {
      const lastMsg = messages.at(-1);
      if (lastMsg) {
        lastMatch = turns.findIndex(
          (t) =>
            t.message !== undefined &&
            t.role === lastMsg.role &&
            getTextOf(t.message) === getTextOf(lastMsg)
        );
      }
    }
    return lastMatch;
  }

  function findNextUser(messages: readonly UIMessage[]): Turn | undefined {
    const start = matchTranscript(messages);
    return turns.slice(start + 1).find((t) => t.role === "user");
  }

  function materializeAssistantInput(
    input:
      | string
      | UIMessagePart<UIDataTypes, UITools>[]
      | ((ctx: unknown) => void),
    events: ChatEvent[]
  ): UIMessagePart<UIDataTypes, UITools>[] {
    if (typeof input === "string") {
      const writer = createEventWriter<DataTypes, ToolSet>(
        events,
        writerContext
      );
      writer.text(input);
      return materializeParts(events);
    }
    if (typeof input === "function") {
      throw new TypeError(
        "assistant(callback) not implemented in Phase 4 — see Phase 5."
      );
    }
    const cloned = deepClone(input);
    const newEvents = eventsFromParts(cloned);
    reserveFromEvents(newEvents);
    events.push(...newEvents);
    return cloned;
  }

  // Hydrate from options.messages
  if (options.messages) {
    for (const msg of options.messages) {
      const cloned = deepClone(msg) as unknown as UIMessage;
      const events = eventsFromParts(cloned.parts);
      ids.reserveMessageId(cloned.id);
      reserveFromEvents(events);
      turns.push({
        role: cloned.role === "user" ? "user" : "assistant",
        message: cloned,
        messageId: cloned.id,
        events,
        metadata: cloned.metadata,
      });
    }
  }

  const builder: AiSdkChat = {
    user(text = DEFAULT_USER_TEXT, opts: ChatUserOptions<unknown> = {}) {
      const events = flushPendingSleeps();
      const localEvents: ChatEvent[] = [
        { kind: "text", id: "text-1", text, options: { mode: "instant" } },
      ];
      for (const file of opts.files ?? []) {
        const cloned = deepClone(file);
        const { type: _type, ...rest } = cloned;
        localEvents.push({ kind: "file", part: rest });
      }
      const parts = materializeParts(localEvents);
      events.push(...localEvents);
      const metadata =
        opts.metadata === undefined
          ? createMetadata()
          : deepClone(opts.metadata);
      const id = nextMessageIdOrReserve(opts.id);
      const message = defaultCreateMessage({
        id,
        role: "user",
        metadata,
        parts,
      });
      return pushTurn({
        role: "user",
        message,
        messageId: id,
        events,
        metadata,
      });
    },

    assistant(
      input:
        | string
        | UIMessagePart<UIDataTypes, UITools>[]
        | ((ctx: unknown) => void) = DEFAULT_TEXT,
      opts: ChatAssistantOptions<unknown> = {}
    ) {
      const events = flushPendingSleeps();
      const parts = materializeAssistantInput(input, events);
      const metadata =
        opts.metadata === undefined
          ? createMetadata()
          : deepClone(opts.metadata);
      const id = nextMessageIdOrReserve(opts.id);
      const message = defaultCreateMessage({
        id,
        role: "assistant",
        metadata,
        parts,
      });
      return pushTurn({
        role: "assistant",
        message,
        messageId: id,
        events,
        metadata,
      });
    },

    error(errorText = DEFAULT_ERROR) {
      const events: ChatEvent[] = [{ kind: "error", errorText }];
      const metadata = createMetadata();
      const id = ids.nextMessageId();
      const message = defaultCreateMessage({
        id,
        role: "assistant",
        metadata,
        parts: [],
      });
      return pushTurn({
        role: "assistant",
        message,
        messageId: id,
        events,
        metadata,
      });
    },

    sleep(delayMs: number) {
      pendingSleeps.push({ kind: "sleep", delayMs, phase: "before-start" });
      return builder;
    },

    get(count?: number): UIMessage[] {
      const firstContinuation = turns.findIndex((t) => t.resolve !== undefined);
      const total = firstContinuation === -1 ? turns.length : firstContinuation;
      const n = count === undefined ? total : count;
      if (!Number.isInteger(n) || n < 0) {
        throw new RangeError("count must be a non-negative integer.");
      }
      if (firstContinuation !== -1 && n > firstContinuation) {
        throw new Error(
          "get() cannot materialize a continuation turn without a live transcript."
        );
      }
      return turns.slice(0, n).map((t) => deepClone(t.message as UIMessage));
    },

    next(messages: readonly UIMessage[]): UIMessage | null {
      const turn = findNextUser(messages);
      return turn?.message ? deepClone(turn.message) : null;
    },

    transport(): ChatTransport<UIMessage> {
      // Stub for Phase 4 — will be replaced in Phase 6.
      return {
        async sendMessages() {
          return new ReadableStream({
            start(controller) {
              controller.close();
            },
          });
        },
        async reconnectToStream() {
          return null;
        },
      };
    },
  };

  return builder;
}
