"use client";

import { useChat } from "@ai-sdk/react";
import type { UIDataTypes, UIMessage } from "ai";
import { FileCodeIcon, LayersIcon, TerminalIcon } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
import { Message, MessageContent } from "@/components/ui/message";
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
    runCommand: {
      input: { command: string };
      output: { stdout: string };
    };
  }
>;

type ToolPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-runCommand" }
>;

const STACK = `TypeError: Cannot read properties of undefined (reading 'email')
    at seedUsers (prisma/seed.ts:27:34)
    at main (prisma/seed.ts:51:9)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
    at Object.transformer (node_modules/tsx/dist/register.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)`;

const chat = createChat<ChatMessage>()
  .user("Reset the database and seed it.")
  .assistant(({ writer }) => {
    writer
      .tool("runCommand", {
        input: { command: "pnpm prisma migrate reset --skip-seed" },
      })
      .sleep(900)
      .output({
        stdout: `Database reset successful

The following migrations have been applied:

migrations/
  └─ 20260912_init/
  └─ 20260920_add_profiles/`,
      });
    writer
      .tool("runCommand", { input: { command: "pnpm prisma db seed" } })
      .sleep(1200)
      .error(STACK);
    writer.text(
      "The migrations ran, but the seed failed in seedUsers. One fixture has no profile, so profile.email is undefined."
    );
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

function parseFrame(line: string) {
  const match = line.match(/^at (.+) \((.+):(\d+):(\d+)\)$/);

  return {
    file: match?.[2],
    internal: line.includes("node_modules") || line.includes("node:"),
    line,
    lineNumber: match?.[3],
    name: match?.[1],
  };
}

function StackTrace({ stack }: { stack: string }) {
  const [error, ...lines] = stack.split("\n").map((line) => line.trim());
  const frames = lines.map(parseFrame);
  const appFrames = frames.filter((frame) => !frame.internal);
  const internalFrames = frames.filter((frame) => frame.internal);

  return (
    <TraceCollapsible defaultOpen>
      <TraceCollapsibleTrigger>
        <TraceLine status="error">
          <TraceIcon>
            <TerminalIcon />
          </TraceIcon>
          <TraceTitle>{`Failed: ${error}`}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="flex flex-col gap-2">
        <p className="text-destructive font-mono text-xs">{error}</p>
        <Trace>
          {appFrames.map((frame) => (
            <a
              className="decoration-muted-foreground block underline-offset-4 hover:underline"
              href={`#${frame.file}:${frame.lineNumber}`}
              key={frame.line}
            >
              <TraceLine>
                <TraceIcon>
                  <FileCodeIcon />
                </TraceIcon>
                <TraceTitle>
                  {frame.name} in {frame.file}:{frame.lineNumber}
                </TraceTitle>
              </TraceLine>
            </a>
          ))}
          <TraceCollapsible>
            <TraceCollapsibleTrigger>
              <TraceLine>
                <TraceIcon>
                  <LayersIcon />
                </TraceIcon>
                <TraceTitle>
                  {internalFrames.length} framework frames
                </TraceTitle>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <ol className="bg-muted flex flex-col gap-1 overflow-x-auto rounded-md p-3 font-mono text-xs">
                {internalFrames.map((frame) => (
                  <li className="whitespace-nowrap" key={frame.line}>
                    {frame.line}
                  </li>
                ))}
              </ol>
            </TraceCollapsibleContent>
          </TraceCollapsible>
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

function CommandRow({
  part,
  streaming,
}: {
  part: ToolPart;
  streaming: boolean;
}) {
  const command = part.input?.command;

  if (part.state === "output-error") {
    return <StackTrace stack={part.errorText} />;
  }

  if (part.state === "output-available") {
    return (
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <TerminalIcon />
            </TraceIcon>
            <TraceTitle>{`Ran ${command}`}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm">
            <CodeBlockContent className="max-h-64" wrap>
              {part.output.stdout}
            </CodeBlockContent>
          </CodeBlock>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    );
  }

  return (
    <TraceLine status={streaming ? "running" : "error"}>
      <TraceIcon>
        <TerminalIcon />
      </TraceIcon>
      <TraceTitle>
        {streaming ? "Running" : "Failed to run"} {command}
      </TraceTitle>
    </TraceLine>
  );
}

export function StackTraceDemo() {
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
        const tools = message.parts.filter(
          (part) => part.type === "tool-runCommand"
        );
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {tools.length > 0 && (
                <Trace>
                  {tools.map((part) => (
                    <CommandRow
                      key={part.toolCallId}
                      part={part}
                      streaming={streaming}
                    />
                  ))}
                </Trace>
              )}
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
