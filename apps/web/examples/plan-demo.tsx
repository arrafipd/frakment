"use client";

import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleIcon,
  RouteIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
  TraceDescription,
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
  {
    plan: {
      title: string;
      steps: { title: string; status: "done" | "running" | "pending" }[];
    };
  }
>;

type PlanPart = Extract<ChatMessage["parts"][number], { type: "data-plan" }>;

const STEPS = [
  "Install @base-ui/react",
  "Replace the Radix imports",
  "Rename asChild to render",
  "Run the type checker",
];

function _planAt(current: number) {
  return {
    steps: STEPS.map((title, index) => ({
      status:
        index < current ? "done" : index === current ? "running" : "pending",
      title,
    })),
    title: "Plan: migrate to Base UI",
  } satisfies PlanPart["data"];
}

const transcript: ChatMessage[] = [
  {
    id: "msg-1",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        text: "Migrate the dialog components to Base UI.",
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
        data: {
          steps: [
            {
              status: "done",
              title: "Install @base-ui/react",
            },
            {
              status: "done",
              title: "Replace the Radix imports",
            },
            {
              status: "done",
              title: "Rename asChild to render",
            },
            {
              status: "done",
              title: "Run the type checker",
            },
          ],
          title: "Plan: migrate to Base UI",
        },
        id: "plan",
        type: "data-plan",
      },
      {
        state: "done",
        text: "Migrated Dialog and AlertDialog. The type checker passes.",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

const initialMessages: ChatMessage[] = transcript;

const question: ChatMessage | null = transcript[0] ?? null;

function PlanRow({
  plan,
  streaming,
}: {
  plan: PlanPart["data"];
  streaming: boolean;
}) {
  const done = plan.steps.filter((step) => step.status === "done").length;
  const running = streaming && done < plan.steps.length;

  return (
    <TraceCollapsible defaultOpen>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>
            <RouteIcon />
          </TraceIcon>
          <TraceTitle>{plan.title}</TraceTitle>
          <TraceDescription>
            {done} of {plan.steps.length} done
          </TraceDescription>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          {plan.steps.map((step) => (
            <TraceLine
              key={step.title}
              status={
                step.status === "pending"
                  ? "pending"
                  : streaming && step.status === "running"
                    ? "running"
                    : undefined
              }
            >
              <TraceIcon>
                {step.status === "done" ? (
                  <CircleCheckIcon />
                ) : step.status === "running" ? (
                  <CircleDotIcon />
                ) : (
                  <CircleIcon />
                )}
              </TraceIcon>
              <TraceTitle>{step.title}</TraceTitle>
            </TraceLine>
          ))}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function PlanDemo() {
  const { messages, sendMessage, setMessages, status } = useDemoChat(
    transcript,
    initialMessages
  );
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <Message align="end" key={message.id}>
              <MessageContent>
                <Bubble align="end" variant="muted">
                  <BubbleContent>{getMessageText(message)}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          );
        }

        const streaming = busy && message === messages.at(-1);
        const plan = message.parts.find((part) => part.type === "data-plan");
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {plan && (
                <Trace>
                  <PlanRow plan={plan.data} streaming={streaming} />
                </Trace>
              )}
              {text && <p>{text}</p>}
            </MessageContent>
          </Message>
        );
      })}
      {!busy && (
        <Button
          className="mt-auto self-start"
          onClick={() => {
            setMessages([]);
            sendMessage(question);
          }}
          size="sm"
          variant="outline"
        >
          Replay
        </Button>
      )}
    </div>
  );
}
