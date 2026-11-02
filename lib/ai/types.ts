// Port of @shadcn/helpers types (chat-ChArRzRi.d.ts).
// Reference source: node_modules/@shadcn/helpers/dist/chat-ChArRzRi.d.ts
// Behavior parity required — do not change semantics without cross-checking the reference.

import type {
  UIMessage,
  UIMessageChunk,
  UIMessagePart,
  ChatTransport,
  UIDataTypes,
  UITools,
} from "ai";

// ============================================================
// Base
// ============================================================

export type JsonRecord = Record<string, unknown>;
export type DataTypes = Record<string, unknown>;

export interface ToolDefinition {
  input: unknown;
  output: unknown;
}

export type ToolSet = Record<string, ToolDefinition>;

// ============================================================
// Tool scripting
// ============================================================

export interface ToolWriterOptions<
  TOOLS extends ToolSet,
  NAME extends keyof TOOLS,
> {
  toolCallId?: string;
  title?: string;
  toolMetadata?: JsonRecord;
  providerExecuted?: boolean;
  input?: TOOLS[NAME]["input"];
  output?: TOOLS[NAME]["output"];
  errorText?: string;
  dynamic?: boolean;
  needsApproval?: boolean;
  approvalId?: string;
}

export type PendingToolCall<TOOLS extends ToolSet> = {
  [NAME in keyof TOOLS & string]: {
    name: NAME;
    toolCallId: string;
    input: TOOLS[NAME]["input"];
    output: TOOLS[NAME]["output"] | undefined;
    approved?: boolean;
    denied?: boolean;
  };
}[keyof TOOLS & string];

export interface ToolOutputOptions {
  preliminary?: boolean;
}

export interface ToolHandle<OUTPUT> {
  sleep(delayMs: number): ToolHandle<OUTPUT>;
  output(output: OUTPUT, options?: ToolOutputOptions): ToolHandle<OUTPUT>;
  error(errorText?: string): ToolHandle<OUTPUT>;
  denied(): ToolHandle<OUTPUT>;
}

// ============================================================
// Payloads
// ============================================================

export interface StreamTextOptions {
  id?: string;
  delayMs?: number;
  mode?: "stream" | "instant";
}

export interface FilePayload {
  mediaType: string;
  filename?: string;
  url: string;
  providerMetadata?: JsonRecord;
}

export interface ReasoningFilePayload {
  mediaType: string;
  filename?: string;
  url: string;
  providerMetadata?: JsonRecord;
}

export interface SourceUrlPayload {
  sourceId: string;
  url: string;
  title?: string;
  providerMetadata?: JsonRecord;
}

export interface SourceDocumentPayload {
  sourceId: string;
  mediaType: string;
  title: string;
  filename?: string;
  providerMetadata?: JsonRecord;
}

export type DataEventInput<DATA extends DataTypes> = {
  [NAME in keyof DATA & string]: {
    type: `data-${NAME}`;
    id?: string;
    data: DATA[NAME];
    transient?: boolean;
  };
}[keyof DATA & string];

// ============================================================
// Chat options
// ============================================================

export interface ChatIdsOptions {
  messageIdPrefix?: string;
  toolCallIdPrefix?: string;
  sourceIdPrefix?: string;
  approvalIdPrefix?: string;
}

export type ChatOptions = ChatIdsOptions & {
  now?: Date | string;
};

export interface TurnStreamOptions {
  delayMs?: number;
}

export interface ChatUserOptions<METADATA> {
  id?: string;
  metadata?: METADATA;
  files?: (FilePayload & { type?: "file" })[];
}

export interface ChatAssistantOptions<METADATA> {
  id?: string;
  metadata?: METADATA;
}

export type ChatFallback<
  MESSAGE,
  PART,
  DATA extends DataTypes = DataTypes,
  TOOLS extends ToolSet = ToolSet,
  WRITER = EventWriter<DATA, TOOLS>,
> =
  | string
  | PART[]
  | ((context: { writer: WRITER; messages: MESSAGE[] }) => void);

export type ChatTransportOptions<
  MESSAGE,
  PART,
  DATA extends DataTypes = DataTypes,
  TOOLS extends ToolSet = ToolSet,
  WRITER = EventWriter<DATA, TOOLS>,
> = TurnStreamOptions & {
  fallback?: ChatFallback<MESSAGE, PART, DATA, TOOLS, WRITER>;
};

// ============================================================
// EventWriter (fluent DSL for assistant(callback))
// ============================================================

export interface EventWriter<DATA extends DataTypes, TOOLS extends ToolSet> {
  text(text?: string, options?: StreamTextOptions): EventWriter<DATA, TOOLS>;
  reasoning(
    text?: string,
    options?: StreamTextOptions
  ): EventWriter<DATA, TOOLS>;
  sleep(delayMs: number): EventWriter<DATA, TOOLS>;
  data(part: DataEventInput<DATA>): EventWriter<DATA, TOOLS>;
  error(errorText?: string): EventWriter<DATA, TOOLS>;
  tool<NAME extends keyof TOOLS & string>(
    name: NAME,
    options?: ToolWriterOptions<TOOLS, NAME>
  ): ToolHandle<TOOLS[NAME]["output"]>;
  sourceUrl(overrides?: Partial<SourceUrlPayload>): EventWriter<DATA, TOOLS>;
  sourceDocument(
    overrides?: Partial<SourceDocumentPayload>
  ): EventWriter<DATA, TOOLS>;
  file(overrides?: Partial<FilePayload>): EventWriter<DATA, TOOLS>;
  reasoningFile(
    overrides?: Partial<ReasoningFilePayload>
  ): EventWriter<DATA, TOOLS>;
  custom(kind?: string): EventWriter<DATA, TOOLS>;
  stepStart(): EventWriter<DATA, TOOLS>;
}

export interface AssistantTurnContext<
  WRITER,
  MESSAGE,
  TOOLS extends ToolSet = ToolSet,
> {
  writer: WRITER;
  messages?: MESSAGE[];
  toolCall?: PendingToolCall<TOOLS>;
  toolCalls?: PendingToolCall<TOOLS>[];
}

// ============================================================
// Internal events (matches chunk-ZEGKA56A.js event kinds)
// ============================================================

export type ChatEvent =
  | { kind: "text"; id: string; text: string; options?: StreamTextOptions }
  | { kind: "reasoning"; id: string; text: string; options?: StreamTextOptions }
  | {
      kind: "sleep";
      delayMs: number;
      phase: "before-start" | "after-start";
    }
  | {
      kind: "data";
      name: string;
      id: string | undefined;
      data: unknown;
      transient?: boolean;
    }
  | { kind: "error"; errorText: string }
  | {
      kind: "tool-input";
      name: string;
      toolCallId: string;
      title?: string;
      toolMetadata?: JsonRecord;
      providerExecuted?: boolean;
      dynamic?: boolean;
      input: unknown;
    }
  | {
      kind: "tool-approval-request";
      toolCallId: string;
      approvalId: string;
      output?: unknown;
      errorText?: string;
    }
  | {
      kind: "tool-output";
      toolCallId: string;
      output: unknown;
      preliminary?: boolean;
      providerExecuted?: boolean;
      toolMetadata?: JsonRecord;
      dynamic?: boolean;
    }
  | {
      kind: "tool-error";
      toolCallId: string;
      errorText: string;
      providerExecuted?: boolean;
      toolMetadata?: JsonRecord;
      dynamic?: boolean;
    }
  | { kind: "tool-denied"; toolCallId: string }
  | { kind: "source-url"; part: SourceUrlPayload }
  | { kind: "source-document"; part: SourceDocumentPayload }
  | { kind: "file"; part: FilePayload }
  | { kind: "reasoning-file"; part: ReasoningFilePayload }
  | { kind: "custom"; part: { kind: string } & JsonRecord }
  | { kind: "step-start" };

// Envelope for stream sequence (chunk | sleep | close)
export type ChatEventEnvelope =
  | { kind: "chunk"; chunk: UIMessageChunk }
  | { kind: "sleep"; delayMs: number }
  | { kind: "close" };

// ============================================================
// Public Chat interface
// ============================================================

export interface Chat<
  MESSAGE,
  PART,
  TRANSPORT,
  METADATA = unknown,
  DATA extends DataTypes = DataTypes,
  TOOLS extends ToolSet = ToolSet,
  WRITER = EventWriter<DATA, TOOLS>,
> {
  user(
    text?: string,
    options?: ChatUserOptions<METADATA>
  ): Chat<MESSAGE, PART, TRANSPORT, METADATA, DATA, TOOLS, WRITER>;
  assistant(
    input?:
      | string
      | PART[]
      | ((context: AssistantTurnContext<WRITER, MESSAGE, TOOLS>) => void),
    options?: ChatAssistantOptions<METADATA>
  ): Chat<MESSAGE, PART, TRANSPORT, METADATA, DATA, TOOLS, WRITER>;
  error(
    errorText?: string
  ): Chat<MESSAGE, PART, TRANSPORT, METADATA, DATA, TOOLS, WRITER>;
  sleep(
    delayMs: number
  ): Chat<MESSAGE, PART, TRANSPORT, METADATA, DATA, TOOLS, WRITER>;
  get(count?: number): MESSAGE[];
  next(messages: readonly MESSAGE[]): MESSAGE | null;
  transport(
    options?: ChatTransportOptions<MESSAGE, PART, DATA, TOOLS, WRITER>
  ): TRANSPORT;
}

// ============================================================
// AI SDK adapter types (mirror ai-sdk/index.d.ts)
// ============================================================

export type MessageMetadata<UI_MESSAGE extends UIMessage> =
  UI_MESSAGE extends UIMessage<infer METADATA> ? METADATA : unknown;

export type MessageData<UI_MESSAGE extends UIMessage> =
  UI_MESSAGE extends UIMessage<unknown, infer DATA_PARTS>
    ? DATA_PARTS
    : UIDataTypes;

export type MessageTools<UI_MESSAGE extends UIMessage> =
  UI_MESSAGE extends UIMessage<unknown, UIDataTypes, infer TOOLS>
    ? TOOLS
    : UITools;

export type CreateChatOptions<UI_MESSAGE extends UIMessage = UIMessage> =
  ChatOptions & {
    messages?: UIMessage<
      MessageMetadata<UI_MESSAGE>,
      MessageData<UI_MESSAGE>,
      MessageTools<UI_MESSAGE>
    >[];
  };

export type AiSdkChat<UI_MESSAGE extends UIMessage = UIMessage> = Chat<
  UIMessage<
    MessageMetadata<UI_MESSAGE>,
    MessageData<UI_MESSAGE>,
    MessageTools<UI_MESSAGE>
  >,
  UIMessagePart<MessageData<UI_MESSAGE>, MessageTools<UI_MESSAGE>>,
  ChatTransport<
    UIMessage<
      MessageMetadata<UI_MESSAGE>,
      MessageData<UI_MESSAGE>,
      MessageTools<UI_MESSAGE>
    >
  >,
  MessageMetadata<UI_MESSAGE>,
  MessageData<UI_MESSAGE>,
  MessageTools<UI_MESSAGE>
>;

// Re-export AI SDK types (consumed by lib/ai/* modules)
export type {
  UIMessage,
  UIMessageChunk,
  UIMessagePart,
  ChatTransport,
  UIDataTypes,
  UITools,
};
