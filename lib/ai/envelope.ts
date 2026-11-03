// Frakment chat engine — ChatEvent <-> UIMessagePart <-> UIMessageChunk conversion.
// Exports: materializeParts, eventsFromParts, eventsToEnvelope, textStreamEnvelope.

import type {
  UIMessagePart,
  UIDataTypes,
  UITools,
  UIMessageChunk,
  ChatEvent,
  ChatEventEnvelope,
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
          type: "text",
          text: event.text,
          state: "done",
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "reasoning": {
        parts.push({
          type: "reasoning",
          text: event.text,
          state: "done",
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "data": {
        if (event.transient) {
          break;
        }
        upsertPart(parts, {
          type: `data-${event.name}`,
          id: event.id,
          data: event.data,
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "tool-input": {
        upsertPart(parts, {
          type: event.dynamic ? "dynamic-tool" : `tool-${event.name}`,
          ...(event.dynamic ? { toolName: event.name } : {}),
          toolCallId: event.toolCallId,
          title: event.title,
          toolMetadata: event.toolMetadata,
          providerExecuted: event.providerExecuted,
          state: "input-available",
          input: event.input,
        } as UIMessagePart<UIDataTypes, UITools>);
        break;
      }
      case "tool-approval-request": {
        const idx = findToolIndex(parts, event.toolCallId);
        if (idx !== -1) {
          parts[idx] = {
            ...parts[idx],
            state: "approval-requested",
            approval: { id: event.approvalId },
          } as UIMessagePart<UIDataTypes, UITools>;
        }
        break;
      }
      case "tool-output": {
        const idx = findToolIndex(parts, event.toolCallId);
        if (idx !== -1) {
          parts[idx] = {
            ...parts[idx],
            state: "output-available",
            output: event.output,
            preliminary: event.preliminary,
            providerExecuted: event.providerExecuted,
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
            state: "output-error",
            errorText: event.errorText,
            providerExecuted: event.providerExecuted,
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
          kind: "text",
          id: `text-${events.length + 1}`,
          text: (part as { text: string }).text,
          options: { mode: "instant" },
        });
        break;
      }
      case "reasoning": {
        events.push({
          kind: "reasoning",
          id: `reasoning-${events.length + 1}`,
          text: (part as { text: string }).text,
          options: { mode: "instant" },
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
            kind: "data",
            name: stripDataPrefix(dataPart.type),
            id: dataPart.id,
            data: dataPart.data,
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
            kind: "tool-input",
            name: toolName,
            toolCallId: toolPart.toolCallId,
            title: toolPart.title,
            toolMetadata: toolPart.toolMetadata,
            providerExecuted: toolPart.providerExecuted,
            input: toolPart.input ?? {},
          });
          if (
            (toolPart.state === "approval-requested" ||
              toolPart.state === "approval-responded") &&
            toolPart.approval
          ) {
            events.push({
              kind: "tool-approval-request",
              toolCallId: toolPart.toolCallId,
              approvalId: toolPart.approval.id,
            });
          }
          if (toolPart.state === "output-available") {
            events.push({
              kind: "tool-output",
              toolCallId: toolPart.toolCallId,
              output: toolPart.output,
              providerExecuted: toolPart.providerExecuted,
              toolMetadata: toolPart.toolMetadata,
            });
          }
          if (toolPart.state === "output-error") {
            events.push({
              kind: "tool-error",
              toolCallId: toolPart.toolCallId,
              errorText: toolPart.errorText ?? "",
              providerExecuted: toolPart.providerExecuted,
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
            kind: "tool-input",
            name: dynPart.toolName,
            toolCallId: dynPart.toolCallId,
            title: dynPart.title,
            toolMetadata: dynPart.toolMetadata,
            providerExecuted: dynPart.providerExecuted,
            dynamic: true,
            input: dynPart.input ?? {},
          });
          if (dynPart.state === "output-available") {
            events.push({
              kind: "tool-output",
              toolCallId: dynPart.toolCallId,
              output: dynPart.output,
              providerExecuted: dynPart.providerExecuted,
              toolMetadata: dynPart.toolMetadata,
              dynamic: true,
            });
          }
          if (dynPart.state === "output-error") {
            events.push({
              kind: "tool-error",
              toolCallId: dynPart.toolCallId,
              errorText: dynPart.errorText ?? "",
              providerExecuted: dynPart.providerExecuted,
              toolMetadata: dynPart.toolMetadata,
              dynamic: true,
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
    kind: "chunk",
    chunk: { type: startType, id: event.id } as UIMessageChunk,
  });

  const deltas =
    event.options?.mode === "instant" ? [event.text] : splitWords(event.text);
  const delay = event.options?.delayMs ?? context.delayMs;

  for (const delta of deltas) {
    if (delay) {
      out.push({ kind: "sleep", delayMs: delay });
    }
    out.push({
      kind: "chunk",
      chunk: { type: deltaType, id: event.id, delta } as UIMessageChunk,
    });
  }

  out.push({
    kind: "chunk",
    chunk: { type: endType, id: event.id } as UIMessageChunk,
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
  for (;;) {
    const ev = events[start];
    if (!(ev && ev.kind === "sleep" && ev.phase === "before-start")) {
      break;
    }
    out.push({ kind: "sleep", delayMs: ev.delayMs });
    start += 1;
  }

  out.push({
    kind: "chunk",
    chunk: { type: "start", messageId: context.messageId } as UIMessageChunk,
  });

  for (let i = start; i < events.length; i += 1) {
    const event = events[i];
    if (!event) {
      break;
    }
    switch (event.kind) {
      case "sleep": {
        out.push({ kind: "sleep", delayMs: event.delayMs });
        break;
      }
      case "text":
      case "reasoning": {
        textStreamEnvelope(out, event, context);
        break;
      }
      case "data": {
        out.push({
          kind: "chunk",
          chunk: {
            type: `data-${event.name}`,
            name: event.name,
            id: event.id,
            data: event.data,
            transient: event.transient,
          } as UIMessageChunk,
        });
        break;
      }
      case "tool-input": {
        out.push({
          kind: "chunk",
          chunk: {
            type: "tool-input-available",
            toolCallId: event.toolCallId,
            toolName: event.name,
            input: event.input,
            providerExecuted: event.providerExecuted,
            toolMetadata: event.toolMetadata,
            dynamic: event.dynamic,
            title: event.title,
          } as UIMessageChunk,
        });
        break;
      }
      case "tool-approval-request": {
        out.push({
          kind: "chunk",
          chunk: {
            type: "tool-approval-request",
            approvalId: event.approvalId,
            toolCallId: event.toolCallId,
          } as UIMessageChunk,
        });
        break;
      }
      case "tool-output": {
        out.push({
          kind: "chunk",
          chunk: {
            type: "tool-output-available",
            toolCallId: event.toolCallId,
            output: event.output,
            preliminary: event.preliminary,
            providerExecuted: event.providerExecuted,
            toolMetadata: event.toolMetadata,
            dynamic: event.dynamic,
          } as UIMessageChunk,
        });
        break;
      }
      case "tool-error": {
        out.push({
          kind: "chunk",
          chunk: {
            type: "tool-output-error",
            toolCallId: event.toolCallId,
            errorText: event.errorText,
            providerExecuted: event.providerExecuted,
            toolMetadata: event.toolMetadata,
            dynamic: event.dynamic,
          } as UIMessageChunk,
        });
        break;
      }
      case "tool-denied": {
        out.push({
          kind: "chunk",
          chunk: {
            type: "tool-output-denied",
            toolCallId: event.toolCallId,
          } as UIMessageChunk,
        });
        break;
      }
      case "error": {
        out.push(
          {
            kind: "chunk",
            chunk: {
              type: "error",
              errorText: event.errorText,
            } as UIMessageChunk,
          },
          { kind: "close" }
        );
        return out;
      }
      case "source-url": {
        out.push({
          kind: "chunk",
          chunk: { type: "source-url", ...event.part } as UIMessageChunk,
        });
        break;
      }
      case "source-document": {
        out.push({
          kind: "chunk",
          chunk: { type: "source-document", ...event.part } as UIMessageChunk,
        });
        break;
      }
      case "file": {
        out.push({
          kind: "chunk",
          chunk: { type: "file", ...event.part } as UIMessageChunk,
        });
        break;
      }
      case "reasoning-file": {
        out.push({
          kind: "chunk",
          chunk: { type: "reasoning-file", ...event.part } as UIMessageChunk,
        });
        break;
      }
      case "custom": {
        out.push({
          kind: "chunk",
          chunk: { type: "custom", ...event.part } as UIMessageChunk,
        });
        break;
      }
      case "step-start": {
        out.push({
          kind: "chunk",
          chunk: { type: "start-step" } as UIMessageChunk,
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
      kind: "chunk",
      chunk: {
        type: "finish",
        finishReason: "stop",
        messageMetadata: context.messageMetadata,
      } as UIMessageChunk,
    },
    { kind: "close" }
  );
  return out;
}
