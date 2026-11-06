"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  GlobeIcon,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
import { Message, MessageContent } from "@/components/ui/message";
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
import { createChat, getMessageText } from "@/lib/ai";

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

const BUILD_LOG_LINES = ["install    41s", "compile    38s", "images   3m 52s"];

const chat = createChat<ChatMessage>()
  .user("Why is the checkout deploy so slow?")
  .assistant(({ writer }) => {
    const logId = "readBuildLog";
    const readLog = writer.tool("readBuildLog", {
      input: { deployment: "dpl_8Kx2" },
      toolCallId: logId,
    });
    BUILD_LOG_LINES.forEach((_, i) => {
      writer
        .data({
          data: { output: BUILD_LOG_LINES.slice(0, i + 1).join("\n") },
          id: logId,
          type: "data-buildLog",
        })
        .sleep(200);
    });
    readLog.output({ log: BUILD_LOG_LINES.join("\n") });

    writer
      .tool("searchWeb", { input: { query: "next.js image cache key" } })
      .sleep(200)
      .output({
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
      });

    writer
      .tool("searchCode", { input: { query: "cacheKey" } })
      .sleep(200)
      .output({ files: ["next.config.ts", "scripts/optimize-images.ts"] });

    writer.text(
      "Image optimization takes almost four minutes because its cache key includes the commit hash. Key it on the image directory instead."
    );
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

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
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: transcript,
    transport,
  });
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
