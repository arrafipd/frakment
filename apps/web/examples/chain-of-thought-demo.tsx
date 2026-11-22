"use client";

import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  GlobeIcon,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
} from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";
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
  { buildLog: { output: string } },
  {
    searchWeb: {
      input: { query: string };
      output: { results: { title: string; url: string }[] };
    };
    readBuildLog: { input: { deployment: string }; output: { log: string } };
    searchCode: { input: { query: string }; output: { files: string[] } };
  }
>;

type StepPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-searchWeb" | "tool-readBuildLog" | "tool-searchCode" }
>;

const _buildLogLines = ["install    41s", "compile    38s", "images   3m 52s"];

const transcript: ChatMessage[] = [
  {
    id: "msg-1",
    metadata: {
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    parts: [
      {
        text: "Why is the checkout deploy so slow?",
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
        type: "tool-readBuildLog",
        input: {
          deployment: "dpl_8Kx2",
        },
        state: "output-available",
        toolCallId: "readBuildLog",
        output: {
          log: "install    41s\ncompile    38s\nimages   3m 52s",
        },
      },
      {
        data: {
          output: "install    41s\ncompile    38s\nimages   3m 52s",
        },
        id: "readBuildLog",
        type: "data-buildLog",
      },
      {
        type: "tool-searchWeb",
        input: {
          query: "next.js image cache key",
        },
        state: "output-available",
        toolCallId: "call-1",
        output: {
          results: [
            {
              title: "Image component | nextjs.org",
              url: "https://nextjs.org/docs/app/api-reference/components/image",
            },
            {
              title: "Build cache | vercel.com",
              url: "https://vercel.com/docs/deployments/troubleshoot-a-build",
            },
          ],
        },
      },
      {
        type: "tool-searchCode",
        input: {
          query: "cacheKey",
        },
        state: "output-available",
        toolCallId: "call-2",
        output: {
          files: ["next.config.ts", "scripts/optimize-images.ts"],
        },
      },
      {
        state: "done",
        text: "Image optimization takes almost four minutes because its cache key includes the commit hash. Key it on the image directory instead.",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

const initialMessages: ChatMessage[] = transcript;

const question: ChatMessage | null = transcript[0] ?? null;

function StatusIcon({ status }: { status?: "running" | "error" }) {
  if (status === "running") {
    return <Spinner />;
  }
  return status === "error" ? <CircleAlertIcon /> : <CircleCheckIcon />;
}

function Step({
  title,
  status,
  defaultOpen,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  status?: "running" | "error";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  children?: React.ReactNode;
}) {
  const line = (
    <TraceLine status={status}>
      <TraceIcon>
        <StatusIcon status={status} />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
    </TraceLine>
  );
  if (!children) {
    return line;
  }

  const collapsibleProps =
    open === undefined ? { defaultOpen } : { onOpenChange, open };

  return (
    <TraceCollapsible {...collapsibleProps}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>{children}</TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

function describeStep(part: StepPart, status?: "running" | "error"): string {
  const verb = (running: string, done: string, failed: string) =>
    status === "running" ? running : status === "error" ? failed : done;
  if (part.type === "tool-searchWeb") {
    return `${verb("Searching", "Searched", "Failed to search")} the web for ${part.input?.query}`;
  }
  if (part.type === "tool-readBuildLog") {
    return `${verb("Reading", "Read", "Failed to read")} the build log for ${part.input?.deployment}`;
  }
  return `${verb("Searching", "Searched", "Failed to search")} the code for ${part.input?.query}`;
}

function StepRow({
  part,
  streamedLog,
  streaming,
}: {
  part: StepPart;
  streamedLog?: string;
  streaming: boolean;
}) {
  const status =
    part.state === "output-available"
      ? undefined
      : part.state === "output-error" || !streaming
        ? "error"
        : "running";
  const error = part.state === "output-error" && (
    <CodeBlock size="sm" variant="destructive">
      <CodeBlockContent className="max-h-64" wrap>
        {part.errorText}
      </CodeBlockContent>
    </CodeBlock>
  );

  const [userToggled, setUserToggled] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const logText =
    streamedLog ??
    (part.type === "tool-readBuildLog" && part.state === "output-available"
      ? part.output.log
      : "");

  React.useEffect(() => {
    if (!userToggled && logText.length > 0) {
      setLogOpen(true);
    }
  }, [logText, userToggled]);

  const handleLogToggle = (next: boolean) => {
    setUserToggled(true);
    setLogOpen(next);
  };

  if (part.type === "tool-searchWeb") {
    return (
      <Step status={status} title={describeStep(part, status)}>
        {error ||
          (part.state === "output-available" && (
            <Trace>
              {part.output.results.map((result) => (
                <a
                  className="decoration-muted-foreground block underline-offset-4 hover:underline"
                  href={result.url}
                  key={result.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <TraceLine>
                    <TraceIcon>
                      <GlobeIcon />
                    </TraceIcon>
                    <TraceTitle>
                      {result.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </TraceTitle>
                    <TraceIcon>
                      <ArrowUpRightIcon />
                    </TraceIcon>
                  </TraceLine>
                </a>
              ))}
            </Trace>
          ))}
      </Step>
    );
  }

  if (part.type === "tool-readBuildLog") {
    return (
      <Step
        onOpenChange={handleLogToggle}
        open={logOpen}
        status={status}
        title={describeStep(part, status)}
      >
        {error ||
          (logText.length > 0 && (
            <CodeBlock size="sm">
              <CodeBlockContent className="max-h-64" wrap>
                {logText}
              </CodeBlockContent>
            </CodeBlock>
          ))}
      </Step>
    );
  }

  return (
    <Step status={status} title={describeStep(part, status)}>
      {error ||
        (part.state === "output-available" && (
          <div className="flex flex-wrap gap-1.5">
            {part.output.files.map((file) => (
              <Badge className="font-mono" key={file} variant="secondary">
                {file}
              </Badge>
            ))}
          </div>
        ))}
    </Step>
  );
}

function ChainOfThought({
  steps,
  streaming,
  answering,
  logByToolId,
}: {
  steps: StepPart[];
  streaming: boolean;
  answering: boolean;
  logByToolId: Map<string, string>;
}) {
  const [open, setOpen] = React.useState<boolean>();
  const running = streaming && !answering;
  const failed = steps.filter((part) => part.state === "output-error").length;
  const status = running ? "running" : failed > 0 ? "error" : undefined;
  const active = steps.find(
    (p) => p.state !== "output-available" && p.state !== "output-error"
  );
  const title = running
    ? active
      ? describeStep(active, "running")
      : "Researching"
    : `Researched in ${steps.length} steps${failed > 0 ? `, ${failed} failed` : ""}`;
  return (
    <Trace>
      <TraceCollapsible onOpenChange={setOpen} open={open ?? running}>
        <TraceCollapsibleTrigger>
          <TraceLine status={status}>
            <TraceIcon>
              <StatusIcon status={status} />
            </TraceIcon>
            <TraceTitle>{title}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent keepMounted>
          <Trace>
            {steps.map((part) => (
              <StepRow
                key={part.toolCallId}
                part={part}
                streamedLog={logByToolId.get(part.toolCallId)}
                streaming={streaming}
              />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

export function ChainOfThoughtDemo() {
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
        const steps = message.parts.filter(
          (part) =>
            part.type === "tool-searchWeb" ||
            part.type === "tool-readBuildLog" ||
            part.type === "tool-searchCode"
        );
        const logByToolId = new Map<string, string>();
        for (const part of message.parts) {
          if (part.type === "data-buildLog" && part.id) {
            logByToolId.set(part.id, part.data.output);
          }
        }
        const text = getMessageText(message);
        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {steps.length > 0 && (
                <ChainOfThought
                  answering={text.length > 0}
                  logByToolId={logByToolId}
                  steps={steps}
                  streaming={streaming}
                />
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
