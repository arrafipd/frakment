// Port of the reference EventWriter DSL (`P()` function).
// Fluent writer handed to assistant(callback).

import type { IdGenerator } from "./ids";
import type { PayloadFactory } from "./payloads";
import type {
  ChatEvent,
  DataEventInput,
  DataTypes,
  EventWriter,
  FilePayload,
  ReasoningFilePayload,
  SourceDocumentPayload,
  SourceUrlPayload,
  StreamTextOptions,
  ToolHandle,
  ToolSet,
  ToolWriterOptions,
} from "./types";
import { deepClone, stripDataPrefix } from "./utils";

export const DEFAULT_TEXT = "Summarize the uploaded receipt.";
export const DEFAULT_REASONING =
  "I need to inspect the available context before answering.";
export const DEFAULT_ERROR = "An error occurred.";
export const DEFAULT_TOOL_ERROR = "Tool call failed.";

export interface WriterContext {
  ids: IdGenerator;
  payloads: PayloadFactory;
}

export function createEventWriter<
  DATA extends DataTypes = DataTypes,
  TOOLS extends ToolSet = ToolSet,
>(events: ChatEvent[], context: WriterContext): EventWriter<DATA, TOOLS> {
  function nextId(prefix: string): string {
    return `${prefix}-${events.length + 1}`;
  }

  const writer: EventWriter<DATA, TOOLS> = {
    text(text = DEFAULT_TEXT, options: StreamTextOptions = {}) {
      events.push({
        kind: "text",
        id: options.id ?? nextId("text"),
        text,
        options,
      });
      return writer;
    },

    reasoning(text = DEFAULT_REASONING, options: StreamTextOptions = {}) {
      events.push({
        kind: "reasoning",
        id: options.id ?? nextId("reasoning"),
        text,
        options,
      });
      return writer;
    },

    sleep(delayMs: number) {
      events.push({ kind: "sleep", delayMs, phase: "after-start" });
      return writer;
    },

    data(part: DataEventInput<DATA>) {
      const name = stripDataPrefix(part.type);
      const cloned = deepClone(part);
      events.push({
        kind: "data",
        name,
        id: cloned.id,
        data: cloned.data,
        transient: cloned.transient,
      });
      return writer;
    },

    error(errorText = DEFAULT_ERROR) {
      events.push({ kind: "error", errorText });
      return writer;
    },

    tool<NAME extends keyof TOOLS & string>(
      name: NAME,
      options?: ToolWriterOptions<TOOLS, NAME>
    ): ToolHandle<TOOLS[NAME]["output"]> {
      // Implemented in createToolHandle (below) — placeholder to satisfy type
      return createToolHandle<TOOLS, NAME>(events, context, name, options);
    },

    sourceUrl(overrides: Partial<SourceUrlPayload> = {}) {
      events.push({
        kind: "source-url",
        part: context.payloads.sourceUrl(overrides),
      });
      return writer;
    },

    sourceDocument(overrides: Partial<SourceDocumentPayload> = {}) {
      events.push({
        kind: "source-document",
        part: context.payloads.sourceDocument(overrides),
      });
      return writer;
    },

    file(overrides: Partial<FilePayload> = {}) {
      events.push({ kind: "file", part: context.payloads.file(overrides) });
      return writer;
    },

    reasoningFile(overrides: Partial<ReasoningFilePayload> = {}) {
      events.push({
        kind: "reasoning-file",
        part: context.payloads.reasoningFile(overrides),
      });
      return writer;
    },

    custom(kind?: string) {
      events.push({ kind: "custom", part: context.payloads.custom(kind) });
      return writer;
    },

    stepStart() {
      events.push({ kind: "step-start" });
      return writer;
    },
  };

  return writer;
}

// ============================================================
// createToolHandle — fluent ToolHandle (output/error/denied)
// ============================================================

function createToolHandle<
  TOOLS extends ToolSet,
  NAME extends keyof TOOLS & string,
>(
  events: ChatEvent[],
  context: WriterContext,
  name: NAME,
  options: ToolWriterOptions<TOOLS, NAME> = {}
): ToolHandle<TOOLS[NAME]["output"]> {
  const cloned = deepClone(options);
  const toolCallId = cloned.toolCallId ?? context.ids.nextToolCallId();
  if (cloned.toolCallId !== undefined) {
    context.ids.reserveToolCallId(cloned.toolCallId);
  }

  events.push({
    kind: "tool-input",
    name,
    toolCallId,
    title: cloned.title,
    toolMetadata: cloned.toolMetadata,
    providerExecuted: cloned.providerExecuted,
    dynamic: cloned.dynamic,
    input: cloned.input ?? {},
  });

  function guardForApproval(methodName: string): void {
    if (cloned.needsApproval) {
      throw new Error(
        `A needsApproval tool call resolves from the user's decision; remove the ${methodName}() call.`
      );
    }
  }

  const handle: ToolHandle<TOOLS[NAME]["output"]> = {
    sleep(delayMs: number) {
      events.push({ kind: "sleep", delayMs, phase: "after-start" });
      return handle;
    },

    output(output: TOOLS[NAME]["output"], outputOptions = {}) {
      guardForApproval("output");
      events.push({
        kind: "tool-output",
        toolCallId,
        output: deepClone(output),
        preliminary: outputOptions.preliminary,
        providerExecuted: cloned.providerExecuted,
        toolMetadata: cloned.toolMetadata,
        dynamic: cloned.dynamic,
      });
      return handle;
    },

    error(errorText = DEFAULT_TOOL_ERROR) {
      guardForApproval("error");
      events.push({
        kind: "tool-error",
        toolCallId,
        errorText,
        providerExecuted: cloned.providerExecuted,
        toolMetadata: cloned.toolMetadata,
        dynamic: cloned.dynamic,
      });
      return handle;
    },

    denied() {
      guardForApproval("denied");
      events.push({ kind: "tool-denied", toolCallId });
      return handle;
    },
  };

  if (cloned.needsApproval) {
    const approvalId = cloned.approvalId ?? context.ids.nextApprovalId();
    if (cloned.approvalId !== undefined) {
      context.ids.reserveApprovalId(cloned.approvalId);
    }
    events.push({
      kind: "tool-approval-request",
      toolCallId,
      approvalId,
      output: cloned.output,
      errorText: cloned.errorText,
    });
    return handle;
  }

  if (cloned.output !== undefined) {
    handle.output(cloned.output);
  }
  if (cloned.errorText !== undefined) {
    handle.error(cloned.errorText);
  }
  return handle;
}
