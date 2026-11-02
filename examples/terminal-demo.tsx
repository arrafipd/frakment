"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { CheckIcon, ChevronRightIcon, CircleCheckIcon, CircleIcon, LoaderCircleIcon, TerminalSquareIcon } from "@/lib/icons";
import { AnimatePresence, motion } from "motion/react";

import { createChat, getMessageText } from "@/lib/ai";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
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

const EASE = [0.32, 0.72, 0, 1] as const;

type ChatMessage = UIMessage<
  unknown,
  { terminal: { output: string } },
  { runCommand: { input: { command: string }; output: { exitCode: number } } }
>;

type ToolPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-runCommand" }
>;

type OutputLine =
  | { type: "text"; text: string }
  | { type: "success"; text: string }
  | { type: "done"; text: string }
  | { type: "info"; text: string };

const COMMANDS: { id: string; command: string; output: OutputLine[] }[] = [
  {
    id: "build",
    command: "npm run registry:build",
    output: [
      { type: "text", text: "Building fraktment registry..." },
      { type: "success", text: "badge → components/ui/badge.tsx" },
      { type: "success", text: "button → components/ui/button.tsx" },
      { type: "success", text: "terminal → components/ui/terminal.tsx" },
      { type: "done", text: "Built 15 components" },
    ],
  },
  {
    id: "add",
    command: "npx frakment@latest add bubble",
    output: [
      { type: "info", text: "fetched bubble.json" },
      { type: "info", text: "resolved: radix-ui" },
      { type: "success", text: "components/ui/bubble.tsx" },
      { type: "done", text: "bubble added" },
    ],
  },
];

const chat = createChat<ChatMessage>()
  .user("Build the registry and add the bubble component.")
  .assistant(({ writer }) => {
    for (const { id, command, output } of COMMANDS) {
      const tool = writer.tool("runCommand", {
        toolCallId: id,
        input: { command },
      });
      writer
        .data({
          type: "data-terminal",
          id,
          data: { output: "[]" },
        })
        .sleep(300);
      output.forEach((_, index) => {
        writer
          .data({
            type: "data-terminal",
            id,
            data: { output: JSON.stringify(output.slice(0, index + 1)) },
          })
          .sleep(350);
      });
      tool.output({ exitCode: 0 });
    }
    writer.text("Registry built and bubble installed.");
  });

const transport = chat.transport({ delayMs: 20 });

function getOutput(message: ChatMessage, toolCallId: string) {
  for (const part of message.parts) {
    if (part.type === "data-terminal" && part.id === toolCallId) {
      return part.data.output;
    }
  }
  return "";
}

function lineClass(line: string): string {
  const t = line.trimStart();
  if (/^[✓✅]/.test(t)) {
    return "-mx-3 rounded bg-green-500/10 px-3 text-green-700 dark:text-green-400";
  }
  if (/^[✗❌]/.test(t) || /exit code [1-9]/.test(t) || /\berror\b/i.test(t)) {
    return "-mx-3 rounded bg-red-500/10 px-3 text-red-700 dark:text-red-400";
  }
  if (/^[◇🔨>]/.test(t)) {
    return "text-muted-foreground";
  }
  return "";
}

const SmoothTypewriter = ({
  text,
  speed = 22,
}: {
  text: string;
  speed?: number;
}) => {
  return (
    <span className="whitespace-pre">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: (i * speed) / 1000,
            duration: 0.18,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

function OutputLineRow({ line }: { line: OutputLine }) {
  const hasSpinner = line.type !== "text";
  const typingDuration = Math.min((line.text.length * 15) / 1000, 1.2);
  const [ready, setReady] = React.useState(!hasSpinner);

  React.useEffect(() => {
    if (!hasSpinner) return;
    const t = setTimeout(() => setReady(true), typingDuration * 1000);
    return () => clearTimeout(t);
  }, [hasSpinner, typingDuration]);

  const icon = !ready ? (
    <LoaderCircleIcon className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
  ) : line.type === "success" ? (
    <CheckIcon className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
  ) : line.type === "done" ? (
    <CircleCheckIcon className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
  ) : line.type === "info" ? (
    <CircleIcon className="size-3.5 shrink-0 text-muted-foreground" />
  ) : (
    <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
  );

  const textClass = !ready
    ? "text-muted-foreground"
    : line.type === "done"
      ? "font-medium text-green-700 dark:text-green-300"
      : line.type === "success"
        ? "text-foreground"
        : "text-muted-foreground";

  return (
    <div className="flex items-center gap-2">
      <span className="relative size-3.5 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ready ? "done" : "loading"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {icon}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className={`text-sm ${textClass} leading-none transition-colors duration-300`}>
        <SmoothTypewriter text={line.text} />
      </span>
    </div>
  );
}

function OutputLines({
  output,
  totalLines,
  allLines,
}: {
  output: string;
  totalLines: number;
  allLines: OutputLine[];
}) {
  let activeCount = 0;
  try {
    const parsed = output.length ? JSON.parse(output) : [];
    if (Array.isArray(parsed)) activeCount = parsed.length;
  } catch {
    activeCount = output ? 1 : 0;
  }

  return (
    <div
      className="flex flex-col gap-2 font-mono text-xs"
      style={{ minHeight: `${Math.max(totalLines, 1) * 22}px` }}
    >
      {allLines.map((line, i) => (
        <div key={i} style={{ display: i < activeCount ? "block" : "none" }}>
          <OutputLineRow line={line} />
        </div>
      ))}
    </div>
  );
}

function CommandRow({
  part,
  output,
  streaming,
  totalLines,
  allLines,
  defaultOpen,
}: {
  part: ToolPart;
  output: string;
  streaming: boolean;
  totalLines: number;
  allLines: OutputLine[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen ?? false);
  const wasRunningRef = React.useRef(false);

  const running =
    streaming &&
    (part.state === "input-streaming" || part.state === "input-available");
  const failed =
    !running &&
    (part.state !== "output-available" || part.output.exitCode !== 0);

  React.useEffect(() => {
    if (running && !wasRunningRef.current) {
      setOpen(true);
      wasRunningRef.current = true;
    }
  }, [running]);

  const command = part.input?.command ?? "";
  const label = running ? `Running ${command}` : `Ran ${command}`;

  return (
    <TraceCollapsible open={open} onOpenChange={setOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : failed ? "error" : undefined}>
          <TraceIcon>
            {running ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <TerminalSquareIcon className="size-4" />
            )}
          </TraceIcon>
          <TraceTitle>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="inline-block"
            >
              {label}
            </motion.span>
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <figure data-rehype-pretty-code-figure>
          <figcaption
            data-rehype-pretty-code-title
            className="flex items-center gap-2 pr-12 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70"
          >
            <TerminalSquareIcon className="size-4 opacity-70" />
            <span className="min-w-0 truncate font-mono">{command}</span>
            <CopyButton value={command} />
          </figcaption>
          <pre className="no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5">
            <OutputLines output={output} totalLines={totalLines} allLines={allLines} />
          </pre>
        </figure>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function TerminalDemo() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: [],
    transport,
  });
  React.useEffect(() => {
    sendMessage({ text: "Build the registry and add the bubble component." });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {messages.map((message, msgIdx) => {
        if (message.role === "user") {
          return (
            <Message key={`user-${msgIdx}`} align="end">
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
          <Message key={`assistant-${msgIdx}`}>
            <MessageContent className="gap-4">
              {tools.length > 0 && (
                <Trace>
                  {tools.map((part, i) => (
                      <CommandRow
                        key={part.toolCallId}
                        part={part}
                        output={getOutput(message, part.toolCallId)}
                        streaming={streaming}
                        totalLines={COMMANDS.find((c) => c.id === part.toolCallId)?.output.length ?? 0}
                        allLines={COMMANDS.find((c) => c.id === part.toolCallId)?.output ?? []}
                        defaultOpen={busy ? undefined : part === tools.at(-1)}
                      />
                  ))}
                </Trace>
              )}
              {text && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {text}
                </motion.p>
              )}
            </MessageContent>
          </Message>
        );
      })}
      {!busy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Button
            variant="outline"
            size="sm"
            className="mt-auto self-start"
            onClick={() => {
              setMessages([]);
              sendMessage({ text: "Build the registry and add the bubble component." });
            }}
          >
            Replay
          </Button>
        </motion.div>
      )}
    </div>
  );
}
