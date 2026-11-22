"use client";

import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleIcon,
  ListChecksIcon,
  ListTodoIcon,
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
    writeTodos: {
      input: {
        todos: {
          content: string;
          status: "pending" | "in_progress" | "completed";
        }[];
      };
      output: string;
    };
  }
>;

type Todo = Extract<
  ChatMessage["parts"][number],
  { type: "tool-writeTodos"; state: "input-available" }
>["input"]["todos"][number];

const TODOS = [
  "Add a dark variant to the theme tokens",
  "Read the theme from a cookie",
  "Add a toggle to the settings page",
  "Check contrast on the charts",
];

function _todosAt(current: number) {
  return TODOS.map(
    (content, index) =>
      ({
        content,
        status:
          index < current
            ? "completed"
            : index === current
              ? "in_progress"
              : "pending",
      }) satisfies Todo
  );
}

const transcript: ChatMessage[] = [
  {
    id: "msg-1",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        text: "Add dark mode to the settings page.",
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
        type: "tool-writeTodos",
        input: {
          todos: [
            {
              content: "Add a dark variant to the theme tokens",
              status: "in_progress",
            },
            {
              content: "Read the theme from a cookie",
              status: "pending",
            },
            {
              content: "Add a toggle to the settings page",
              status: "pending",
            },
            {
              content: "Check contrast on the charts",
              status: "pending",
            },
          ],
        },
        state: "output-available",
        toolCallId: "call-1",
        output: "Updated the todo list.",
      },
      {
        type: "tool-writeTodos",
        input: {
          todos: [
            {
              content: "Add a dark variant to the theme tokens",
              status: "completed",
            },
            {
              content: "Read the theme from a cookie",
              status: "in_progress",
            },
            {
              content: "Add a toggle to the settings page",
              status: "pending",
            },
            {
              content: "Check contrast on the charts",
              status: "pending",
            },
          ],
        },
        state: "output-available",
        toolCallId: "call-2",
        output: "Updated the todo list.",
      },
      {
        type: "tool-writeTodos",
        input: {
          todos: [
            {
              content: "Add a dark variant to the theme tokens",
              status: "completed",
            },
            {
              content: "Read the theme from a cookie",
              status: "completed",
            },
            {
              content: "Add a toggle to the settings page",
              status: "in_progress",
            },
            {
              content: "Check contrast on the charts",
              status: "pending",
            },
          ],
        },
        state: "output-available",
        toolCallId: "call-3",
        output: "Updated the todo list.",
      },
      {
        type: "tool-writeTodos",
        input: {
          todos: [
            {
              content: "Add a dark variant to the theme tokens",
              status: "completed",
            },
            {
              content: "Read the theme from a cookie",
              status: "completed",
            },
            {
              content: "Add a toggle to the settings page",
              status: "completed",
            },
            {
              content: "Check contrast on the charts",
              status: "in_progress",
            },
          ],
        },
        state: "output-available",
        toolCallId: "call-4",
        output: "Updated the todo list.",
      },
      {
        type: "tool-writeTodos",
        input: {
          todos: [
            {
              content: "Add a dark variant to the theme tokens",
              status: "completed",
            },
            {
              content: "Read the theme from a cookie",
              status: "completed",
            },
            {
              content: "Add a toggle to the settings page",
              status: "completed",
            },
            {
              content: "Check contrast on the charts",
              status: "completed",
            },
          ],
        },
        state: "output-available",
        toolCallId: "call-5",
        output: "Updated the todo list.",
      },
      {
        state: "done",
        text: "Dark mode is in. The toggle is under Settings, Appearance.",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

const initialMessages: ChatMessage[] = transcript;

const question: ChatMessage | null = transcript[0] ?? null;

function TodoLine({ todo, streaming }: { todo: Todo; streaming: boolean }) {
  return (
    <TraceLine
      status={
        streaming && todo.status === "in_progress" ? "running" : undefined
      }
    >
      <TraceIcon>
        {todo.status === "completed" ? (
          <CircleCheckIcon />
        ) : todo.status === "in_progress" ? (
          <CircleDotIcon />
        ) : (
          <CircleIcon />
        )}
      </TraceIcon>
      <TraceTitle>{todo.content}</TraceTitle>
    </TraceLine>
  );
}

function TodoQueue({
  todos,
  streaming,
}: {
  todos: Todo[];
  streaming: boolean;
}) {
  const pending = todos.filter((todo) => todo.status !== "completed");
  const completed = todos.filter((todo) => todo.status === "completed");

  return (
    <Trace>
      {pending.length > 0 && (
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <ListTodoIcon />
              </TraceIcon>
              <TraceTitle>{pending.length} to do</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Trace>
              {pending.map((todo) => (
                <TodoLine
                  key={todo.content}
                  streaming={streaming}
                  todo={todo}
                />
              ))}
            </Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      )}
      {completed.length > 0 && (
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <ListChecksIcon />
              </TraceIcon>
              <TraceTitle>{completed.length} completed</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Trace>
              {completed.map((todo) => (
                <TodoLine
                  key={todo.content}
                  streaming={streaming}
                  todo={todo}
                />
              ))}
            </Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      )}
    </Trace>
  );
}

export function QueueDemo() {
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
        const todos = message.parts
          .filter((part) => part.type === "tool-writeTodos")
          .filter((part) => part.state !== "input-streaming")
          .at(-1)?.input?.todos;
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {todos && <TodoQueue streaming={streaming} todos={todos} />}
              {text && <p>{text}</p>}
            </MessageContent>
          </Message>
        );
      })}
      {!busy && question && (
        <Button
          className="mt-auto self-start"
          onClick={() => {
            if (!question) {
              return;
            }
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
