// Public entry for the internal deterministic chat engine.
// Consumers: lib/ai.ts (re-export) + examples/*.tsx (via @/lib/ai).

import { getMessageText } from "./adapter";
import { createChatBuilder } from "./builder";
import type { AiSdkChat, CreateChatOptions, UIMessage } from "./types";

export { createAiSdkAdapter, getToolCalls } from "./adapter";
export type {
  AiSdkChat,
  AssistantTurnContext,
  Chat,
  ChatAssistantOptions,
  ChatEvent,
  ChatEventEnvelope,
  ChatFallback,
  ChatIdsOptions,
  ChatOptions,
  ChatTransport,
  ChatTransportOptions,
  ChatUserOptions,
  CreateChatOptions,
  DataEventInput,
  DataTypes,
  EventWriter,
  FilePayload,
  JsonRecord,
  PendingToolCall,
  ReasoningFilePayload,
  SourceDocumentPayload,
  SourceUrlPayload,
  StreamTextOptions,
  ToolDefinition,
  ToolHandle,
  ToolOutputOptions,
  ToolSet,
  ToolWriterOptions,
  TurnStreamOptions,
  UIDataTypes,
  UIMessage,
  UIMessageChunk,
  UIMessagePart,
  UITools,
} from "./types";
export { getMessageText };

// ============================================================
// createChat — public factory (mirrors reference AI SDK adapter).
// ============================================================

export function createChat<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: CreateChatOptions<UI_MESSAGE>
): AiSdkChat<UI_MESSAGE> {
  return createChatBuilder(
    options as never
  ) as unknown as AiSdkChat<UI_MESSAGE>;
}
