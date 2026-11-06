"use client";

import { useChat } from "@ai-sdk/react";
import type { UIDataTypes, UIMessage } from "ai";
import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  GlobeIcon,
} from "lucide-react";
import * as React from "react";
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
  UIDataTypes,
  {
    runCommand: { input: { command: string }; output: { stdout: string } };
  }
>;

type Part = ChatMessage["parts"][number];

const chat = createChat<ChatMessage>()
  .user("Why does pnpm install fail in CI?")
  .assistant(({ writer }) => {
    writer.reasoning(
      "CI installs with a frozen lockfile, so the install stops when package.json and pnpm-lock.yaml disagree. I should check what the last commit changed, then reproduce the install.",
      { delayMs: 40 }
    );
    writer
      .tool("runCommand", { input: { command: "pnpm --version" } })
      .sleep(700)
      .output({ stdout: "10.18.0" });
    writer
      .tool("runCommand", {
        input: {
          command: "git diff --stat HEAD~1 -- package.json pnpm-lock.yaml",
        },
      })
      .sleep(900)
      .output({
        stdout:
          " package.json | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)",
      });
    writer
      .tool("runCommand", {
        input: { command: "pnpm install --frozen-lockfile" },
      })
      .sleep(1200)
      .error(
        'ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json'
      );
    writer.sourceUrl({
      title: "pnpm install | pnpm.io",
      url: "https://pnpm.io/cli/install#--frozen-lockfile",
    });
    writer.sourceUrl({
      title: "Continuous Integration | pnpm.io",
      url: "https://pnpm.io/continuous-integration",
    });
    writer.sleep(1000);
    writer.text(
      "The last commit bumped a version in package.json without updating pnpm-lock.yaml, so the frozen install fails. Run pnpm install locally and commit the lockfile."
    );
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

function ThinkingRow({ text, running }: { text: string; running: boolean }) {
  const [open, setOpen] = React.useState<boolean>();
  const line = (
    <TraceLine status={running ? "running" : undefined}>
      <TraceIcon>{running ? <Spinner /> : <CircleCheckIcon />}</TraceIcon>
      <TraceTitle>{running ? "Thinking" : "Thought for 5s"}</TraceTitle>
    </TraceLine>
  );
  if (text.length === 0) {
    return line;
  }
  return (
    <TraceCollapsible onOpenChange={setOpen} open={open ?? running}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

function ToolRow({
  part,
  streaming,
  defaultOpen,
}: {
  part: Extract<Part, { type: "tool-runCommand" }>;
  streaming: boolean;
  defaultOpen?: boolean;
}) {
  const command = part.input?.command;
  if (part.state === "output-available" || part.state === "output-error") {
    const failed = part.state === "output-error";
    return (
      <TraceCollapsible defaultOpen={defaultOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status={failed ? "error" : undefined}>
            <TraceIcon>
              {failed ? <CircleAlertIcon /> : <CircleCheckIcon />}
            </TraceIcon>
            <TraceTitle>
              {failed ? "Failed to run" : "Ran"} {command}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          {failed ? (
            <CodeBlock size="sm" variant="destructive">
              <CodeBlockContent className="max-h-64" wrap>
                {part.errorText}
              </CodeBlockContent>
            </CodeBlock>
          ) : (
            <CodeBlock size="sm">
              <CodeBlockContent className="max-h-64" wrap>
                {part.output.stdout}
              </CodeBlockContent>
            </CodeBlock>
          )}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    );
  }
  return (
    <TraceLine status={streaming ? "running" : "error"}>
      <TraceIcon>{streaming ? <Spinner /> : <CircleAlertIcon />}</TraceIcon>
      <TraceTitle>
        {streaming ? "Running" : "Failed to run"} {command}
      </TraceTitle>
    </TraceLine>
  );
}

function SourcesRow({
  sources,
  running,
}: {
  sources: Extract<Part, { type: "source-url" }>[];
  running: boolean;
}) {
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>{running ? <Spinner /> : <GlobeIcon />}</TraceIcon>
          <TraceTitle>
            {running ? "Using" : "Used"} {sources.length} sources
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          {sources.map((source) => (
            <a
              href={source.url}
              key={source.url}
              rel="noreferrer"
              target="_blank"
            >
              <TraceLine>
                <TraceIcon>
                  <GlobeIcon />
                </TraceIcon>
                <TraceTitle>
                  {source.title ?? new URL(source.url).hostname}
                  <span className="sr-only"> (opens in a new tab)</span>
                </TraceTitle>
                <TraceIcon>
                  <ArrowUpRightIcon />
                </TraceIcon>
              </TraceLine>
            </a>
          ))}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function TraceDemo() {
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
        const rows = message.parts.filter(
          (part) => part.type === "reasoning" || part.type === "tool-runCommand"
        );
        const sources = message.parts.filter(
          (part) => part.type === "source-url"
        );
        const text = getMessageText(message);
        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {rows.length + sources.length > 0 && (
                <Trace>
                  {rows.map((part, index) =>
                    part.type === "reasoning" ? (
                      <ThinkingRow
                        key={index}
                        running={streaming && part.state === "streaming"}
                        text={part.text}
                      />
                    ) : part.type === "tool-runCommand" ? (
                      <ToolRow
                        defaultOpen={index === 2}
                        key={part.toolCallId}
                        part={part}
                        streaming={streaming}
                      />
                    ) : null
                  )}
                  {sources.length > 0 && (
                    <SourcesRow
                      running={streaming && text.length === 0}
                      sources={sources}
                    />
                  )}
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
