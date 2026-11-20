// Frakment chat engine — ChatEvent <-> UIMessagePart <-> UIMessageChunk conversion.
// Exports: materializeParts, eventsFromParts, eventsToEnvelope, textStreamEnvelope.

import type {
  ChatEvent,
  ChatEventEnvelope,
  UIDataTypes,
  UIMessageChunk,
  UIMessagePart,
  UITools,
} from "./types";
import { assertNever, splitWords, stripDataPrefix } from "./utils";

// ============================================================
// materializeParts (I) — convert ChatEvent[] → UIMessagePart[]
// ============================================================

function upsertPart(
  parts: UIMessagePart<UIDataTypes, UITools>[],
  part: UIMessagePart<UIDataTypes, UITools>
): void {
  if ("id" in part && part.id) {
    const existing = parts.findIndex(
      (p) => p.type === part.type && "id" in p && p.id === part.id
    );
    if (existing !== -1) {
      parts[existing] = part;
      return;
    }
  }
  parts.push(part);
}

function findToolIndex(
  parts: UIMessagePart<UIDataTypes, UITools>[],
  toolCallId: string
): number {
  return parts.findIndex(
    (p) =>
      (p.type === "dynamic-tool" || p.type.startsWith("tool-")) &&
      "toolCallId" in p &&
      p.toolCallId === toolCallId
  );
}

export function materializeParts(
  events: readonly ChatEvent[]
): UIMessagePart<UIDataTypes, UITools>[] {
  const parts: UIMessagePart<UIDataTypes, UITools>[] = [];
  for (const event of events) {
    switch (event.kind) {
      case "text": {
        parts.push({
          state: "done",
          text: event.text,
          type: "text",
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "reasoning": {
        parts.push({
          state: "done",
          text: event.text,
          type: "reasoning",
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "data": {
        if (event.transient) {
          break;
        }
        upsertPart(parts, {
          data: event.data,
          id: event.id,
          type: `data-${event.name}`,
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "tool-input": {
        upsertPart(parts, {
          type: event.dynamic ? "dynamic-tool" : `tool-${event.name}`,
          ...(event.dynamic ? { toolName: event.name } : {}),
          input: event.input,
          providerExecuted: event.providerExecuted,
          state: "input-available",
          title: event.title,
          toolCallId: event.toolCallId,
          toolMetadata: event.toolMetadata,
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "tool-approval-request": {
        const idx = findToolIndex(parts, event.toolCallId);
        if (idx !== -1) {
          parts[idx] = {
            ...parts[idx],
            approval: { id: event.approvalId },
            state: "approval-requested",
          } as UIMessagePart<UIDataTypes, UITools>;
        }
        break;
      }
      case "tool-output": {
        const idx = findToolIndex(parts, event.toolCallId);
        if (idx !== -1) {
          parts[idx] = {
            ...parts[idx],
            output: event.output,
            preliminary: event.preliminary,
            providerExecuted: event.providerExecuted,
            state: "output-available",
            toolMetadata: event.toolMetadata,
          } as UIMessagePart<UIDataTypes, UITools>;
        }
        break;
      }
      case "tool-error": {
        const idx = findToolIndex(parts, event.toolCallId);
        if (idx !== -1) {
          parts[idx] = {
            ...parts[idx],
            errorText: event.errorText,
            providerExecuted: event.providerExecuted,
            state: "output-error",
            toolMetadata: event.toolMetadata,
          } as UIMessagePart<UIDataTypes, UITools>;
        }
        break;
      }
      case "tool-denied": {
        const idx = findToolIndex(parts, event.toolCallId);
        if (idx !== -1) {
          parts[idx] = {
            ...parts[idx],
            state: "output-denied",
          } as UIMessagePart<UIDataTypes, UITools>;
        }
        break;
      }
      case "source-url": {
        parts.push({ ...event.part, type: "source-url" } as UIMessagePart<
          UIDataTypes,
          UITools
        >);
        break;
      }
      case "source-document": {
        parts.push({ ...event.part, type: "source-document" } as UIMessagePart<
          UIDataTypes,
          UITools
        >);
        break;
      }
      case "file": {
        parts.push({ ...event.part, type: "file" } as UIMessagePart<
          UIDataTypes,
          UITools
        >);
        break;
      }
      case "reasoning-file": {
        parts.push({ ...event.part, type: "reasoning-file" } as UIMessagePart<
          UIDataTypes,
          UITools
        >);
        break;
      }
      case "custom": {
        parts.push({ ...event.part, type: "custom" } as UIMessagePart<
          UIDataTypes,
          UITools
        >);
        break;
      }
      case "step-start": {
        parts.push({ type: "step-start" } as UIMessagePart<
          UIDataTypes,
          UITools
        >);
        break;
      }
      case "sleep":
      case "error": {
        break;
      }
      default: {
        // exhaustiveness check
        const _exhaustive: never = event;
        void _exhaustive;
      }
    }
  }
  return parts;
}

// ============================================================
// eventsFromParts (M) — UIMessagePart[] → ChatEvent[]
// ============================================================

export function eventsFromParts(
  parts: readonly UIMessagePart<UIDataTypes, UITools>[]
): ChatEvent[] {
  const events: ChatEvent[] = [];
  for (const part of parts) {
    switch (part.type) {
      case "text": {
        events.push({
          id: `text-${events.length + 1}`,
          kind: "text",
          options: { mode: "instant" },
          text: (part as { text: string }).text,
        });
        break;
      }
      case "reasoning": {
        events.push({
          id: `reasoning-${events.length + 1}`,
          kind: "reasoning",
          options: { mode: "instant" },
          text: (part as { text: string }).text,
        });
        break;
      }
      default: {
        if (part.type.startsWith("data-")) {
          const dataPart = part as {
            type: string;
            id?: string;
            data?: unknown;
          };
          events.push({
            data: dataPart.data,
            id: dataPart.id,
            kind: "data",
            name: stripDataPrefix(dataPart.type),
          });
        } else if (part.type.startsWith("tool-") && "toolCallId" in part) {
          const toolPart = part as {
            type: string;
            toolCallId: string;
            title?: string;
            toolMetadata?: Record<string, unknown>;
            providerExecuted?: boolean;
            state: string;
            input?: unknown;
            output?: unknown;
            errorText?: string;
            approval?: { id: string };
          };
          const toolName = toolPart.type.replace("tool-", "");
          events.push({
            input: toolPart.input ?? {},
            kind: "tool-input",
            name: toolName,
            providerExecuted: toolPart.providerExecuted,
            title: toolPart.title,
            toolCallId: toolPart.toolCallId,
            toolMetadata: toolPart.toolMetadata,
          });
          if (
            (toolPart.state === "approval-requested" ||
              toolPart.state === "approval-responded") &&
            toolPart.approval
          ) {
            events.push({
              approvalId: toolPart.approval.id,
              kind: "tool-approval-request",
              toolCallId: toolPart.toolCallId,
            });
          }
          if (toolPart.state === "output-available") {
            events.push({
              kind: "tool-output",
              output: toolPart.output,
              providerExecuted: toolPart.providerExecuted,
              toolCallId: toolPart.toolCallId,
              toolMetadata: toolPart.toolMetadata,
            });
          }
          if (toolPart.state === "output-error") {
            events.push({
              errorText: toolPart.errorText ?? "",
              kind: "tool-error",
              providerExecuted: toolPart.providerExecuted,
              toolCallId: toolPart.toolCallId,
              toolMetadata: toolPart.toolMetadata,
            });
          }
          if (toolPart.state === "output-denied") {
            events.push({
              kind: "tool-denied",
              toolCallId: toolPart.toolCallId,
            });
          }
        } else if (part.type === "dynamic-tool") {
          const dynPart = part as {
            toolName: string;
            toolCallId: string;
            title?: string;
            toolMetadata?: Record<string, unknown>;
            providerExecuted?: boolean;
            state: string;
            input?: unknown;
            output?: unknown;
            errorText?: string;
            approval?: { id: string };
          };
          events.push({
            dynamic: true,
            input: dynPart.input ?? {},
            kind: "tool-input",
            name: dynPart.toolName,
            providerExecuted: dynPart.providerExecuted,
            title: dynPart.title,
            toolCallId: dynPart.toolCallId,
            toolMetadata: dynPart.toolMetadata,
          });
          if (dynPart.state === "output-available") {
            events.push({
              dynamic: true,
              kind: "tool-output",
              output: dynPart.output,
              providerExecuted: dynPart.providerExecuted,
              toolCallId: dynPart.toolCallId,
              toolMetadata: dynPart.toolMetadata,
            });
          }
          if (dynPart.state === "output-error") {
            events.push({
              dynamic: true,
              errorText: dynPart.errorText ?? "",
              kind: "tool-error",
              providerExecuted: dynPart.providerExecuted,
              toolCallId: dynPart.toolCallId,
              toolMetadata: dynPart.toolMetadata,
            });
          }
        } else if (part.type === "source-url") {
          events.push({ kind: "source-url", part: part as never });
        } else if (part.type === "source-document") {
          events.push({ kind: "source-document", part: part as never });
        } else if (part.type === "file") {
          events.push({ kind: "file", part: part as never });
        } else if (part.type === "reasoning-file") {
          events.push({ kind: "reasoning-file", part: part as never });
        } else if (part.type === "custom") {
          events.push({ kind: "custom", part: part as never });
        } else if (part.type === "step-start") {
          events.push({ kind: "step-start" });
        }
      }
    }
  }
  return events;
}

// ============================================================
// textStreamEnvelope (Y) — append text/reasoning chunks + sleeps
// ============================================================

export interface EnvelopeContext {
  delayMs?: number;
  messageId?: string;
  messageMetadata?: unknown;
}

function textStreamEnvelope(
  out: ChatEventEnvelope[],
  event: Extract<ChatEvent, { kind: "text" } | { kind: "reasoning" }>,
  context: EnvelopeContext
): void {
  const isText = event.kind === "text";
  const startType = isText ? "text-start" : "reasoning-start";
  const deltaType = isText ? "text-delta" : "reasoning-delta";
  const endType = isText ? "text-end" : "reasoning-end";

  out.push({
    chunk: { id: event.id, type: startType } as UIMessageChunk,
    kind: "chunk",
  });

  const deltas =
    event.options?.mode === "instant" ? [event.text] : splitWords(event.text);
  const delay = event.options?.delayMs ?? context.delayMs;

  for (const delta of deltas) {
    if (delay) {
      out.push({ delayMs: delay, kind: "sleep" });
    }
    out.push({
      chunk: { delta, id: event.id, type: deltaType } as UIMessageChunk,
      kind: "chunk",
    });
  }

  out.push({
    chunk: { id: event.id, type: endType } as UIMessageChunk,
    kind: "chunk",
  });
}

// ============================================================
// eventsToEnvelope (q) — ChatEvent[] → ChatEventEnvelope[]
// ============================================================

export function eventsToEnvelope(
  events: readonly ChatEvent[],
  context: EnvelopeContext
): ChatEventEnvelope[] {
  const out: ChatEventEnvelope[] = [];
  let start = 0;

  // Hoist leading "before-start" sleeps before the start chunk
  while (true) {
    const ev = events[start];
    if (!(ev && ev.kind === "sleep" && ev.phase === "before-start")) {
      break;
    }
    out.push({ delayMs: ev.delayMs, kind: "sleep" });
    start += 1;
  }

  out.push({
    chunk: { messageId: context.messageId, type: "start" } as UIMessageChunk,
    kind: "chunk",
  });

  for (let i = start; i < events.length; i += 1) {
    const event = events[i];
    if (!event) {
      break;
    }
    switch (event.kind) {
      case "sleep": {
        out.push({ delayMs: event.delayMs, kind: "sleep" });
        break;
      }
      case "text":
      case "reasoning": {
        textStreamEnvelope(out, event, context);
        break;
      }
      case "data": {
        out.push({
          chunk: {
            data: event.data,
            id: event.id,
            name: event.name,
            transient: event.transient,
            type: `data-${event.name}`,
          } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "tool-input": {
        out.push({
          chunk: {
            dynamic: event.dynamic,
            input: event.input,
            providerExecuted: event.providerExecuted,
            title: event.title,
            toolCallId: event.toolCallId,
            toolMetadata: event.toolMetadata,
            toolName: event.name,
            type: "tool-input-available",
          } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "tool-approval-request": {
        out.push({
          chunk: {
            approvalId: event.approvalId,
            toolCallId: event.toolCallId,
            type: "tool-approval-request",
          } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "tool-output": {
        out.push({
          chunk: {
            dynamic: event.dynamic,
            output: event.output,
            preliminary: event.preliminary,
            providerExecuted: event.providerExecuted,
            toolCallId: event.toolCallId,
            toolMetadata: event.toolMetadata,
            type: "tool-output-available",
          } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "tool-error": {
        out.push({
          chunk: {
            dynamic: event.dynamic,
            errorText: event.errorText,
            providerExecuted: event.providerExecuted,
            toolCallId: event.toolCallId,
            toolMetadata: event.toolMetadata,
            type: "tool-output-error",
          } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "tool-denied": {
        out.push({
          chunk: {
            toolCallId: event.toolCallId,
            type: "tool-output-denied",
          } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "error": {
        out.push(
          {
            chunk: {
              errorText: event.errorText,
              type: "error",
            } as UIMessageChunk,
            kind: "chunk",
          },
          { kind: "close" }
        );
        return out;
      }
      case "source-url": {
        out.push({
          chunk: { type: "source-url", ...event.part } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "source-document": {
        out.push({
          chunk: { type: "source-document", ...event.part } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "file": {
        out.push({
          chunk: { type: "file", ...event.part } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "reasoning-file": {
        out.push({
          chunk: { type: "reasoning-file", ...event.part } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "custom": {
        out.push({
          chunk: { type: "custom", ...event.part } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      case "step-start": {
        out.push({
          chunk: { type: "start-step" } as UIMessageChunk,
          kind: "chunk",
        });
        break;
      }
      default: {
        assertNever(event);
      }
    }
  }

  out.push(
    {
      chunk: {
        finishReason: "stop",
        messageMetadata: context.messageMetadata,
        type: "finish",
      } as UIMessageChunk,
      kind: "chunk",
    },
    { kind: "close" }
  );
  return out;
}
