// Port of the reference AI SDK adapter (index.js `S()` factory).
// Reference source: external helper library, ported 1:1.
//
// FrameworkAdapter is the dependency-injection layer for ChatBuilder. It exposes
// the framework-specific helpers the builder needs: materialize/encode/transport.
// For AI SDK v7, createAiSdkAdapter() returns the concrete implementation.

import { defaultCreateMessage } from "./builder";
import { materializeParts, eventsFromParts } from "./envelope";
import type { UIMessage, UIMessagePart, UIDataTypes, UITools } from "./types";

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
  toolCallId: string;
  name: string;
  dynamic: boolean;
  input: unknown;
  output: unknown;
  errorText: string | undefined;
  state: string;
  approval?: {
    id: string;
    approved?: boolean;
    reason?: string;
  };
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
    toolCallId: part.toolCallId,
    name,
    dynamic,
    input: part.input,
    output: part.state === "output-available" ? part.output : undefined,
    errorText: part.state === "output-error" ? part.errorText : undefined,
    state: part.state,
    approval: part.approval,
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
  materializeParts: typeof materializeParts;
  eventsFromParts: typeof eventsFromParts;
  createMessage: typeof defaultCreateMessage;
  getMessageId: (message: UIMessage) => string;
  getMessageRole: (message: UIMessage) => "user" | "assistant" | "system";
  getMessageText: (message: UIMessage) => string;
  getMessageParts: (
    message: UIMessage
  ) => UIMessagePart<UIDataTypes, UITools>[];
  getMessageMetadata: (message: UIMessage) => unknown;
  getToolCalls: (message: UIMessage) => ToolCallDescriptor[];
}

export function createAiSdkAdapter(): FrameworkAdapter {
  return {
    materializeParts,
    eventsFromParts,
    createMessage: defaultCreateMessage,
    getMessageId: (message) => message.id,
    getMessageRole: (message) => message.role,
    getMessageText,
    getMessageParts: (message) => message.parts,
    getMessageMetadata: (message) => message.metadata,
    getToolCalls,
  };
}
