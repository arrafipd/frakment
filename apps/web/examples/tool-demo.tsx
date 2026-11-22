"use client";

import { TerminalIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
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

interface ToolPart {
  errorText?: string;
  input: { command: string };
  output?: { stdout: string };
  state: string;
  toolCallId: string;
  type: "tool-runCommand";
}

interface TextPart {
  text: string;
  type: "text";
}
interface ChatMessage {
  id: string;
  parts: (TextPart | ToolPart)[];
  role: "user" | "assistant";
}

const transcript: ChatMessage[] = [
  {
    id: "msg-1",
    parts: [{ text: "Which package managers are installed?", type: "text" }],
    role: "user",
  },
  {
    id: "msg-2",
    parts: [
      {
        input: { command: "node --version" },
        output: { stdout: "v24.18.0" },
        state: "output-available",
        toolCallId: "call-1",
        type: "tool-runCommand",
      },
      {
        input: { command: "npm --version" },
        output: { stdout: "11.6.2" },
        state: "output-available",
        toolCallId: "call-2",
        type: "tool-runCommand",
      },
      {
        errorText: "command not found: pnpm",
        input: { command: "pnpm --version" },
        state: "output-error",
        toolCallId: "call-3",
        type: "tool-runCommand",
      },
      {
        text: "Node 24 and npm 11 are installed. pnpm is not.",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

function getMessageText(message: ChatMessage): string {
  return message.parts
    .filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function ToolRow({
  part,
  streaming,
  defaultOpen,
}: {
  part: ToolPart;
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
              <TerminalIcon />
            </TraceIcon>
            <TraceTitle>
              {failed ? "Failed to run" : "Ran"} {command}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm">
            <CodeBlockContent className="max-h-64" wrap>
              {failed ? part.errorText : part.output?.stdout}
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

export function ToolDemo() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(transcript);
  const [busy, setBusy] = React.useState(false);

  function replay() {
    setMessages([transcript[0]]);
    setBusy(true);
    window.setTimeout(() => {
      setMessages(transcript);
      setBusy(false);
    }, 350);
  }

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
          (part): part is ToolPart => part.type === "tool-runCommand"
        );
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {tools.length > 0 && (
                <Trace>
                  {tools.map((part) => (
                    <ToolRow
                      defaultOpen={
                        busy ? undefined : part.state === "output-error"
                      }
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
      {!busy && transcript.length > 0 && (
        <Button
          className="mt-auto self-start"
          onClick={replay}
          size="sm"
          variant="outline"
        >
          Replay
        </Button>
      )}
    </div>
  );
}
