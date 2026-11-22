"use client";

import { CircleCheckIcon, LoaderCircleIcon, TerminalIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
} from "@/components/ui/message";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

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
  UIDataTypes,
  {
    runCommand: {
      input: { command: string };
      output: { stdout: string };
    };
  }
>;

const transcript: ChatMessage[] = [
  {
    id: "msg-1",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        text: "Clean up the build folder.",
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
        text: "The build output lives in dist. Deleting it cannot be undone, so I should ask before I run the command.",
        type: "reasoning",
      },
      {
        type: "tool-runCommand",
        input: {
          command: "rm -rf dist",
        },
        state: "approval-requested",
        toolCallId: "call-1",
        approval: {
          id: "approval-1",
        },
      },
    ],
    role: "assistant",
  },
];

const initialMessages: ChatMessage[] = [];

export function ConfirmationDemo() {
  const {
    messages,
    sendMessage,
    setMessages,
    status,
    addToolApprovalResponse,
  } = useDemoChat(transcript, initialMessages);
  const shouldReduceMotion = useReducedMotion();
  const nextMessage = getNextMessage(transcript, messages);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <motion.div
              animate={shouldReduceMotion ? undefined : "animate"}
              initial={shouldReduceMotion ? undefined : "initial"}
              key={message.id}
              variants={{
                animate: { opacity: 1, y: 0 },
                initial: { opacity: 0, y: 8 },
              }}
            >
              <Message align="end">
                <MessageContent>
                  <Bubble align="end" variant="muted">
                    <BubbleContent>{getMessageText(message)}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            </motion.div>
          );
        }

        return (
          <motion.div
            animate={shouldReduceMotion ? undefined : "animate"}
            initial={shouldReduceMotion ? undefined : "initial"}
            key={message.id}
            variants={{ animate: { opacity: 1 }, initial: { opacity: 0 } }}
          >
            <Message>
              <MessageContent className="gap-4">
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return <p key={index}>{part.text}</p>;
                  }

                  if (part.type === "reasoning") {
                    return (
                      <Trace key={index}>
                        <ReasoningRow
                          running={part.state === "streaming"}
                          text={part.text}
                        />
                      </Trace>
                    );
                  }

                  if (part.type !== "tool-runCommand") {
                    return null;
                  }

                  if (part.state === "approval-requested") {
                    return (
                      <motion.div
                        animate={shouldReduceMotion ? undefined : "animate"}
                        initial={shouldReduceMotion ? undefined : "initial"}
                        key={part.toolCallId}
                        variants={{
                          animate: { opacity: 1, y: 0 },
                          initial: { opacity: 0, y: 8 },
                        }}
                      >
                        <Item variant="outline">
                          <ItemMedia>
                            <TerminalIcon />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>Run {part.input.command}?</ItemTitle>
                            <ItemDescription>
                              The command runs in this project.
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              onClick={() =>
                                addToolApprovalResponse({
                                  approved: false,
                                  id: part.approval.id,
                                })
                              }
                              size="sm"
                              variant="outline"
                            >
                              Deny
                            </Button>
                            <Button
                              onClick={() =>
                                addToolApprovalResponse({
                                  approved: true,
                                  id: part.approval.id,
                                })
                              }
                              size="sm"
                            >
                              Approve
                            </Button>
                          </ItemActions>
                        </Item>
                      </motion.div>
                    );
                  }

                  const denied =
                    part.state === "output-denied" ||
                    (part.state === "approval-responded" &&
                      !part.approval.approved);

                  return (
                    <React.Fragment key={part.toolCallId}>
                      <Trace>
                        <TraceLine
                          status={
                            !denied && part.state !== "output-available"
                              ? "running"
                              : undefined
                          }
                        >
                          <TraceIcon>
                            <TerminalIcon />
                          </TraceIcon>
                          <TraceTitle>
                            {denied
                              ? "Denied"
                              : part.state === "output-available"
                                ? "Ran"
                                : "Running"}
                            {part.input?.command}
                          </TraceTitle>
                        </TraceLine>
                      </Trace>
                    </React.Fragment>
                  );
                })}
              </MessageContent>
            </Message>
          </motion.div>
        );
      })}
      {!busy && (
        <Button
          className="mt-auto self-start"
          onClick={() =>
            nextMessage
              ? sendMessage(nextMessage)
              : setMessages(initialMessages)
          }
          size="sm"
          variant="outline"
        >
          {nextMessage ? "Send message" : "Reset"}
        </Button>
      )}
    </div>
  );
}

function ReasoningRow({ text, running }: { text: string; running: boolean }) {
  const [open, setOpen] = React.useState<boolean>();

  return (
    <TraceCollapsible onOpenChange={setOpen} open={open ?? running}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>
            {running ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <CircleCheckIcon />
            )}
          </TraceIcon>
          <TraceTitle>{running ? "Thinking" : "Thought"}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
