// Public entry for the internal @shadcn/helpers replacement.
// Consumers: lib/ai.ts (re-export) + examples/*.tsx (via @/lib/ai).

import { getMessageText } from "./adapter";
import { createChatBuilder } from "./builder";
import type { AiSdkChat, CreateChatOptions, UIMessage } from "./types";

export { getMessageText };
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

// ============================================================
// createChat — public factory (mirror @shadcn/helpers/ai-sdk)
// ============================================================

export function createChat<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: CreateChatOptions<UI_MESSAGE>
): AiSdkChat<UI_MESSAGE> {
  return createChatBuilder(
    options as never
  ) as unknown as AiSdkChat<UI_MESSAGE>;
}
