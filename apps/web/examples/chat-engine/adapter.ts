// Frakment chat engine — AI SDK v7 adapter helpers.
// Exports: getMessageText, getToolCalls, FrameworkAdapter, createAiSdkAdapter.

import { defaultCreateMessage } from "./builder";
import { eventsFromParts, materializeParts } from "./envelope";
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "./types";

// ============================================================
// getMessageText (T) — extract concatenated text parts
// ============================================================

export function getMessageText(message: UIMessage): string {
  if (!Array.isArray(message.parts)) {
    return "";
  }
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" &&
        typeof (part as { text?: string }).text === "string"
    )
    .map((part) => part.text)
    .join("");
}

// ============================================================
// getToolCalls (A) — extract tool call descriptors from a message
// ============================================================

export interface ToolCallDescriptor {
  approval?: {
    id: string;
    approved?: boolean;
    reason?: string;
  };
  dynamic: boolean;
  errorText: string | undefined;
  input: unknown;
  name: string;
  output: unknown;
  state: string;
  toolCallId: string;
}

function fromToolPart(
  part: {
    type: string;
    toolCallId: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
    state: string;
    approval?: { id: string; approved?: boolean; reason?: string };
  },
  name: string,
  dynamic: boolean
): ToolCallDescriptor {
  return {
    approval: part.approval,
    dynamic,
    errorText: part.state === "output-error" ? part.errorText : undefined,
    input: part.input,
    name,
    output: part.state === "output-available" ? part.output : undefined,
    state: part.state,
    toolCallId: part.toolCallId,
  };
}

export function getToolCalls(message: UIMessage): ToolCallDescriptor[] {
  const out: ToolCallDescriptor[] = [];
  for (const part of message.parts) {
    if (part.type === "dynamic-tool") {
      out.push(
        fromToolPart(
          part as never,
          (part as { toolName: string }).toolName,
          true
        )
      );
      continue;
    }
    if (part.type.startsWith("tool-") && "toolCallId" in part) {
      out.push(
        fromToolPart(part as never, part.type.replace("tool-", ""), false)
      );
    }
  }
  return out;
}

// ============================================================
// FrameworkAdapter interface (dependency injection for ChatBuilder)
// ============================================================

export interface FrameworkAdapter {
  createMessage: typeof defaultCreateMessage;
  eventsFromParts: typeof eventsFromParts;
  getMessageId: (message: UIMessage) => string;
  getMessageMetadata: (message: UIMessage) => unknown;
  getMessageParts: (
    message: UIMessage
  ) => UIMessagePart<UIDataTypes, UITools>[];
  getMessageRole: (message: UIMessage) => "user" | "assistant" | "system";
  getMessageText: (message: UIMessage) => string;
  getToolCalls: (message: UIMessage) => ToolCallDescriptor[];
  materializeParts: typeof materializeParts;
}

export function createAiSdkAdapter(): FrameworkAdapter {
  return {
    createMessage: defaultCreateMessage,
    eventsFromParts,
    getMessageId: (message) => message.id,
    getMessageMetadata: (message) => message.metadata,
    getMessageParts: (message) => message.parts,
    getMessageRole: (message) => message.role,
    getMessageText,
    getToolCalls,
    materializeParts,
  };
}
