"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
} from "@/components/ui/message";

interface DemoToolInput {
  command?: string;
  deployment?: string;
  path?: string;
  query?: string;
  task?: string;
  todos?: { content: string; status: string }[];
  [key: string]: unknown;
}

interface DemoToolOutput {
  content?: string;
  exitCode?: number;
  files?: string[];
  log?: string;
  parts?: unknown[];
  path?: string;
  results?: { title: string; url: string }[];
  stdout?: string;
  suites?: {
    name: string;
    tests: { error?: string; name: string; status: string }[];
  }[];
}

type UIDataTypes = Record<string, unknown>;
type UITools = Record<string, { input: unknown; output: unknown }>;

type DataUIPart<Data> = {
  [Name in keyof Data & string]: {
    data: Data[Name];
    id: string;
    type: `data-${Name}`;
  };
}[keyof Data & string];

type ToolUIPart<Tools> = {
  [Name in keyof Tools & string]: Tools[Name] extends {
    input: infer Input;
    output: infer Output;
  }
    ?
        | {
            input: Input;
            preliminary?: boolean;
            state: "input-available";
            toolCallId: string;
            type: `tool-${Name}`;
          }
        | {
            input: Input;
            preliminary?: boolean;
            state: "input-streaming";
            toolCallId: string;
            type: `tool-${Name}`;
          }
        | {
            approval: { approved?: boolean; id: string };
            input: Input;
            preliminary?: boolean;
            state: "approval-requested" | "approval-responded";
            toolCallId: string;
            type: `tool-${Name}`;
          }
        | {
            input: Input;
            output: Output;
            preliminary?: boolean;
            state: "output-available";
            toolCallId: string;
            type: `tool-${Name}`;
          }
        | {
            errorText: string;
            input: Input;
            preliminary?: boolean;
            state: "output-error";
            toolCallId: string;
            type: `tool-${Name}`;
          }
        | {
            approval: { approved?: boolean; id: string };
            input: Input;
            preliminary?: boolean;
            state: "output-denied";
            toolCallId: string;
            type: `tool-${Name}`;
          }
    : never;
}[keyof Tools & string];

interface DynamicToolUIPart {
  errorText?: string;
  input?: DemoToolInput;
  output?: DemoToolOutput;
  state:
    | "approval-requested"
    | "approval-responded"
    | "input-available"
    | "input-streaming"
    | "output-available"
    | "output-denied"
    | "output-error";
  toolCallId: string;
  toolName: string;
  type: "dynamic-tool";
}

interface UIMessage<Metadata = unknown, Data = UIDataTypes, Tools = UITools> {
  id: string;
  metadata?: Metadata;
  parts: (
    | { state?: string; text: string; type: "text" }
    | { state?: string; text: string; type: "reasoning" }
    | DataUIPart<Data>
    | ToolUIPart<Tools>
    | DynamicToolUIPart
    | { sourceId: string; title?: string; type: "source-url"; url: string }
  )[];
  role: "assistant" | "system" | "user";
}

function getMessageText(message: {
  parts: Array<{ text?: string; type: string }>;
}): string {
  return message.parts
    .filter(
      (part): part is { text: string; type: "text" } =>
        part.type === "text" && typeof part.text === "string"
    )
    .map((part) => part.text)
    .join("");
}

function getNextMessage<Message extends { id: string; role: string }>(
  transcript: Message[],
  messages: Message[]
): Message | null {
  const seen = new Set(messages.map((message) => message.id));
  return (
    transcript.find(
      (message) => message.role === "user" && !seen.has(message.id)
    ) ?? null
  );
}

function useDemoChat(
  transcript: ChatMessage[],
  initialMessages: ChatMessage[],
  fallbackText?: string
) {
  const [messages, setMessages] =
    React.useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = React.useState<
    "ready" | "submitted" | "streaming"
  >("ready");
  const nextMessage = getNextMessage(transcript, messages);

  function sendMessage(input?: ChatMessage | { text: string } | null): void {
    const prompt = input && "id" in input ? input : nextMessage;
    if (!prompt) {
      return;
    }
    const index = transcript.findIndex((message) => message.id === prompt.id);
    const scriptedPrompt = transcript[index];
    if (scriptedPrompt?.role !== "user") {
      throw new Error("The demo prompt is missing from its local transcript.");
    }
    const reply = transcript
      .slice(index + 1)
      .find((message) => message.role === "assistant");
    if (!reply) {
      throw new Error("The demo reply is missing from its local transcript.");
    }

    const customText = input && !("id" in input) ? input.text : undefined;
    const userMessage: ChatMessage =
      customText === undefined
        ? scriptedPrompt
        : { ...scriptedPrompt, parts: [{ text: customText, type: "text" }] };
    const assistantMessage: ChatMessage =
      customText !== undefined &&
      fallbackText !== undefined &&
      customText.trim() !== getMessageText(scriptedPrompt)
        ? {
            id: `${scriptedPrompt.id}-fallback`,
            metadata: scriptedPrompt.metadata,
            parts: [{ text: fallbackText, type: "text" }],
            role: "assistant",
          }
        : reply;

    setMessages((current) => [...current, userMessage]);
    setStatus("submitted");
    window.setTimeout(() => {
      setMessages((current) => [...current, assistantMessage]);
      setStatus("streaming");
      window.setTimeout(() => setStatus("ready"), 250);
    }, 250);
  }

  function addToolApprovalResponse(input: {
    approved: boolean;
    id: string;
  }): void {
    setMessages((current) =>
      current.map(
        (message) =>
          ({
            ...message,
            parts: message.parts.map((part) =>
              "approval" in part && part.approval?.id === input.id
                ? {
                    ...part,
                    approval: { id: input.id, approved: input.approved },
                    state: input.approved
                      ? "output-available"
                      : "output-denied",
                  }
                : part
            ),
          }) as ChatMessage
      )
    );
  }

  return {
    addToolApprovalResponse,
    messages,
    nextMessage,
    sendMessage,
    setMessages,
    status,
  };
}

type ChatMessage = UIMessage<
  unknown,
  {
    checkpoint: {
      label: string;
    };
  }
>;

type CheckpointPart = Extract<
  ChatMessage["parts"][number],
  { type: "data-checkpoint" }
>;

const transcript: ChatMessage[] = [
  {
    id: "msg-1",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        text: "Rename the button component to action.",
        type: "text",
      },
    ],
    role: "user",
  },
  {
    id: "msg-2",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        state: "done",
        text: "Renamed Button to Action in components/ui/button.tsx.",
        type: "text",
      },
      {
        data: {
          label: "Button renamed",
        },
        id: "rename",
        type: "data-checkpoint",
      },
    ],
    role: "assistant",
  },
  {
    id: "msg-3",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        text: "Update the docs to match.",
        type: "text",
      },
    ],
    role: "user",
  },
  {
    id: "msg-4",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        state: "done",
        text: "Updated the Button page to say Action.",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

const initialMessages: ChatMessage[] = transcript;

export function CheckpointDemo() {
  const { messages, sendMessage, setMessages, status } = useDemoChat(
    transcript,
    initialMessages
  );
  const shouldReduceMotion = useReducedMotion();
  const nextMessage = getNextMessage(transcript, messages);
  const busy = status === "submitted" || status === "streaming";

  function restore(messageId: string) {
    const index = messages.findIndex((message) => message.id === messageId);

    if (index === -1) {
      return;
    }

    setMessages(messages.slice(0, index + 1));
  }

  return (
    <div className="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {messages.map((message) => {
        const checkpoint = message.parts.find(
          (part): part is CheckpointPart => part.type === "data-checkpoint"
        );
        const index = messages.findIndex((item) => item.id === message.id);
        const canRestore = index < messages.length - 1;

        return (
          <motion.div
            animate={shouldReduceMotion ? undefined : "animate"}
            className="flex flex-col gap-4"
            initial={shouldReduceMotion ? undefined : "initial"}
            key={message.id}
            variants={{
              animate: { opacity: 1, y: 0 },
              initial: { opacity: 0, y: 8 },
            }}
          >
            {message.role === "user" ? (
              <Message align="end">
                <MessageContent>
                  <Bubble align="end" variant="muted">
                    <BubbleContent>{getMessageText(message)}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            ) : (
              <Message>
                <MessageContent>
                  <p>{getMessageText(message)}</p>
                </MessageContent>
              </Message>
            )}
            {checkpoint && (
              <motion.div
                animate={shouldReduceMotion ? undefined : "animate"}
                initial={shouldReduceMotion ? undefined : "initial"}
                variants={{ animate: { opacity: 1 }, initial: { opacity: 0 } }}
              >
                <Marker variant="separator">
                  <MarkerContent className="inline-flex items-center gap-2">
                    {checkpoint.data.label}
                    {canRestore && (
                      <Button
                        aria-label={`Restore to ${checkpoint.data.label}`}
                        className="h-6 rounded-full px-2.5 text-xs"
                        onClick={() => restore(message.id)}
                        size="sm"
                        variant="outline"
                      >
                        Restore
                      </Button>
                    )}
                  </MarkerContent>
                </Marker>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      {!busy && nextMessage && (
        <Button
          className="mt-auto self-start"
          onClick={() => sendMessage(nextMessage)}
          size="sm"
          variant="outline"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
