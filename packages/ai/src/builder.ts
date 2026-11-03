// Frakment chat engine â€” ChatBuilder: turn scripting, continuation, transport.

import {
  eventsFromParts,
  eventsToEnvelope,
  materializeParts,
} from "./envelope";
import { createIdGenerator } from "./ids";
import { createPayloadFactory } from "./payloads";
import { streamFromEnvelope } from "./stream";
import type {
  AiSdkChat,
  ChatAssistantOptions,
  ChatEvent,
  ChatTransport,
  ChatTransportOptions,
  ChatUserOptions,
  CreateChatOptions,
  DataTypes,
  ToolSet,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from "./types";
import { deepClone } from "./utils";
import type { WriterContext } from "./writer";
import { createEventWriter, DEFAULT_ERROR, DEFAULT_TEXT } from "./writer";

export const DEFAULT_USER_TEXT = "Summarize the uploaded receipt.";

export interface Turn {
  continuation?: boolean;
  events: ChatEvent[];
  lastEvents?: ChatEvent[];
  message?: UIMessage;
  messageId: string;
  metadata?: unknown;
  resolve?: unknown;
  role: "user" | "assistant";
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
    return { id: input.id, metadata: input.metadata, parts, role: "user" };
  }
  return {
    id: input.id,
    metadata: input.metadata,
    parts: input.parts,
    role: "assistant",
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
// createChatBuilder â€” core methods (Phase 4)
// Transport + continuation will be added in Phase 5/6.
// ============================================================

function getTextOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// ============================================================
// Continuation helpers â€” pending tools, fallback, resolve turn, continuation materialization.
// ============================================================

interface PendingToolRaw {
  approval?: Extract<ChatEvent, { kind: "tool-approval-request" }>;
  input: Extract<ChatEvent, { kind: "tool-input" }>;
}

function getPendingToolsRaw(events: readonly ChatEvent[]): PendingToolRaw[] {
  const resolved = new Set<string>();
  for (const event of events) {
    if (
      (event.kind === "tool-output" && !event.preliminary) ||
      event.kind === "tool-error" ||
      event.kind === "tool-denied"
    ) {
      resolved.add(event.toolCallId);
    }
  }
  const out: PendingToolRaw[] = [];
  for (const event of events) {
    if (event.kind === "tool-input" && !resolved.has(event.toolCallId)) {
      out.push({
        approval: events.find(
          (e) =>
            e.kind === "tool-approval-request" &&
            e.toolCallId === event.toolCallId
        ) as Extract<ChatEvent, { kind: "tool-approval-request" }> | undefined,
        input: event,
      });
    }
  }
  return out;
}

function _toPendingToolCall(
  raw: PendingToolRaw,
  summary:
    | {
        toolCallId?: string;
        input?: unknown;
        output?: unknown;
        state?: string;
        approval?: { approved?: boolean };
      }
    | undefined
): {
  name: string;
  toolCallId: string;
  input: unknown;
  output: unknown;
  approved?: boolean;
  denied?: boolean;
} {
  const approvalApproved = raw.approval
    ? summary?.approval?.approved
    : undefined;

  let output: unknown;
  if (raw.approval) {
    output = approvalApproved === true ? raw.approval.output : undefined;
  } else if (summary?.state === "output-available") {
    const { output: summaryOutput } = summary;
    output = summaryOutput;
  } else {
    output = undefined;
  }

  const approvalFields = raw.approval
    ? {
        approved: approvalApproved === true,
        denied: approvalApproved === false,
      }
    : {};

  return {
    input: summary?.input ?? raw.input.input,
    name: raw.input.name,
    output,
    toolCallId: raw.input.toolCallId,
    ...approvalFields,
  };
}

function _defaultMetadata(
  now: Date | string | undefined
): () => Record<string, unknown> {
  const date =
    now instanceof Date ? now : new Date(now ?? "2026-01-01T00:00:00.000Z");
  return () => ({ createdAt: date.toISOString() });
}

function findNextAssistant(turns: readonly Turn[], from: number): number {
  for (let i = from; i < turns.length; i += 1) {
    if (turns[i]?.role === "assistant") {
      return i;
    }
  }
  return -1;
}

function lastAssistantIndex(turns: readonly Turn[], upTo: number): number {
  for (let i = upTo - 1; i >= 0; i -= 1) {
    if (turns[i]?.role === "assistant") {
      return i;
    }
  }
  return -1;
}

function resolveTurnIndex(
  turns: readonly Turn[],
  messages: readonly UIMessage[],
  matchTranscript: (msgs: readonly UIMessage[]) => number,
  regenerateId: string | undefined
): number {
  if (regenerateId) {
    const idx = turns.findIndex((t) => t.messageId === regenerateId);
    if (turns[idx]?.role === "assistant") {
      return idx;
    }
    if (idx !== -1) {
      return findNextAssistant(turns, idx + 1);
    }
  }
  const matched = matchTranscript(messages);
  return findNextAssistant(turns, matched + 1);
}

function hasContinuation(turns: readonly Turn[]): boolean {
  const last = turns.at(-1);
  if (last?.role !== "assistant") {
    return false;
  }
  return (
    last.resolve !== undefined || getPendingToolsRaw(last.events).length > 0
  );
}

function buildFallbackResponse(
  fallback: NonNullable<
    ChatTransportOptions<
      UIMessage,
      UIMessagePart<UIDataTypes, UITools>
    >["fallback"]
  >,
  messages: readonly UIMessage[],
  _writerContext: WriterContext,
  createMetadata: () => Record<string, unknown>,
  ids: ReturnType<typeof createIdGenerator>,
  materialize: (
    input:
      | string
      | UIMessagePart<UIDataTypes, UITools>[]
      | ((ctx: unknown) => void),
    events: ChatEvent[]
  ) => UIMessagePart<UIDataTypes, UITools>[]
): Turn {
  const events: ChatEvent[] = [];
  const input =
    typeof fallback === "function"
      ? (ctx: unknown) => fallback({ ...(ctx as object), messages } as never)
      : fallback;
  const parts = materialize(input as never, events);
  const metadata = createMetadata();
  const id = ids.nextMessageId();
  return {
    events,
    message: defaultCreateMessage({ id, metadata, parts, role: "assistant" }),
    messageId: id,
    metadata,
    role: "assistant",
  };
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
    events: ChatEvent[],
    messages?: readonly UIMessage[],
    toolCalls?: {
      name: string;
      toolCallId: string;
      input: unknown;
      output: unknown;
      approved?: boolean;
      denied?: boolean;
    }[]
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
      const writer = createEventWriter<DataTypes, ToolSet>(
        events,
        writerContext
      );
      const callbackContext: Record<string, unknown> = { writer };
      if (messages !== undefined) {
        callbackContext.messages = messages;
      }
      if (toolCalls !== undefined) {
        callbackContext.toolCall = toolCalls.at(-1);
        callbackContext.toolCalls = toolCalls;
      }
      input(callbackContext as never);
      reserveFromEvents(events);
      return materializeParts(events);
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
        events,
        message: cloned,
        messageId: cloned.id,
        metadata: cloned.metadata,
        role: cloned.role === "user" ? "user" : "assistant",
      });
    }
  }

  // biome-ignore lint: forward reference ke tipe `AiSdkChat` yang dideklarasikan setelahnya - false positive noUseBeforeDefine
  const builder: AiSdkChat = {
    assistant(
      input:
        | string
        | UIMessagePart<UIDataTypes, UITools>[]
        | ((ctx: unknown) => void) = DEFAULT_TEXT,
      opts: ChatAssistantOptions<unknown> = {}
    ) {
      const events = flushPendingSleeps();
      const isContinuation = hasContinuation(turns);
      if (typeof input === "function" && isContinuation) {
        // Continuation turn: defer materialization until transcript arrives.
        const id = nextMessageIdOrReserve(opts.id);
        const metadata =
          opts.metadata === undefined ? undefined : deepClone(opts.metadata);
        return pushTurn({
          continuation: true,
          events,
          messageId: id,
          metadata,
          resolve: input,
          role: "assistant",
        });
      }
      if (isContinuation) {
        events.push({ kind: "step-start" });
      }
      const parts = materializeAssistantInput(input, events);
      const metadata =
        opts.metadata === undefined
          ? createMetadata()
          : deepClone(opts.metadata);
      const id = nextMessageIdOrReserve(opts.id);
      const message = defaultCreateMessage({
        id,
        metadata,
        parts,
        role: "assistant",
      });
      return pushTurn({
        events,
        message,
        messageId: id,
        metadata,
        role: "assistant",
        ...(isContinuation ? { continuation: true } : {}),
      });
    },

    error(errorText = DEFAULT_ERROR) {
      const events: ChatEvent[] = [{ errorText, kind: "error" }];
      const metadata = createMetadata();
      const id = ids.nextMessageId();
      const message = defaultCreateMessage({
        id,
        metadata,
        parts: [],
        role: "assistant",
      });
      return pushTurn({
        events,
        message,
        messageId: id,
        metadata,
        role: "assistant",
      });
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

    sleep(delayMs: number) {
      pendingSleeps.push({ delayMs, kind: "sleep", phase: "before-start" });
      return builder;
    },

    transport(
      transportOpts: ChatTransportOptions<
        UIMessage,
        UIMessagePart<UIDataTypes, UITools>
      > = {}
    ): ChatTransport<UIMessage> {
      const lastIdx = lastAssistantIndex(turns, turns.length);
      const lastTurn = turns[lastIdx];
      if (
        lastTurn &&
        !lastTurn.resolve &&
        getPendingToolsRaw(lastTurn.events).some((p) => p.approval)
      ) {
        // Dev warning only â€” no continuation turn follows, decision will be lost.
        // See reference behavior: silently ignore in production.
      }
      const streamOpts = { delayMs: 50, ...transportOpts };
      const { fallback } = transportOpts;
      return {
        async reconnectToStream() {
          return null;
        },
        async sendMessages({ messages, messageId, abortSignal }) {
          const regenerateId =
            messageId !== undefined && messageId !== null
              ? messageId
              : undefined;
          const idx = resolveTurnIndex(
            turns,
            messages,
            matchTranscript,
            regenerateId
          );
          const turn = idx === -1 ? undefined : turns[idx];
          if (!turn) {
            if (fallback !== undefined) {
              const fallbackTurn = buildFallbackResponse(
                fallback as never,
                messages,
                writerContext,
                createMetadata,
                ids,
                materializeAssistantInput
              );
              const envelope = eventsToEnvelope(fallbackTurn.events, {
                delayMs: streamOpts.delayMs,
                messageId: fallbackTurn.messageId,
                messageMetadata: fallbackTurn.metadata,
              });
              return streamFromEnvelope(
                envelope,
                (chunk) => chunk,
                abortSignal ?? undefined
              );
            }
            throw new Error("No assistant response found for this transcript.");
          }
          const envelope = eventsToEnvelope(turn.events, {
            delayMs: streamOpts.delayMs,
            messageId: turn.continuation ? undefined : turn.messageId,
            messageMetadata: turn.metadata,
          });
          return streamFromEnvelope(
            envelope,
            (chunk) => chunk,
            abortSignal ?? undefined
          );
        },
      };
    },
    user(text = DEFAULT_USER_TEXT, opts: ChatUserOptions<unknown> = {}) {
      const events = flushPendingSleeps();
      const localEvents: ChatEvent[] = [
        { id: "text-1", kind: "text", options: { mode: "instant" }, text },
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
        metadata,
        parts,
        role: "user",
      });
      return pushTurn({
        events,
        message,
        messageId: id,
        metadata,
        role: "user",
      });
    },
  };

  return builder;
}
