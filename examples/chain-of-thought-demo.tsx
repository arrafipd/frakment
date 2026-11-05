"use client";

import { useChat } from "@ai-sdk/react";
import type { UIDataTypes, UIMessage } from "ai";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  FileCode2Icon,
  LoaderCircleIcon,
  NetworkIcon,
} from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
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
    analyzeBundle: {
      input: { entry: string };
      output: { breakdown: { name: string; kb: number }[] };
    };
    profileNetwork: {
      input: { route: string };
      output: { requests: { path: string; ms: number }[] };
    };
    scanRenderTree: {
      input: { component: string };
      output: { files: string[] };
    };
  }
>;

type StepPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-analyzeBundle" | "tool-profileNetwork" | "tool-scanRenderTree" }
>;

const chat = createChat<ChatMessage>()
  .user("Why is the dashboard taking 4 seconds to load?")
  .assistant(({ writer }) => {
    writer
      .tool("analyzeBundle", { input: { entry: "dashboard" } })
      .sleep(900)
      .output({
        breakdown: [
          { kb: 1240, name: "vendor.js" },
          { kb: 812, name: "chart-lib.js" },
          { kb: 340, name: "dashboard.js" },
          { kb: 180, name: "icons.js" },
        ],
      });
    writer
      .tool("profileNetwork", { input: { route: "/dashboard" } })
      .sleep(900)
      .output({
        requests: [
          { ms: 620, path: "GET /api/stats" },
          { ms: 410, path: "GET /api/charts" },
          { ms: 210, path: "GET /api/user" },
        ],
      });
    writer
      .tool("scanRenderTree", { input: { component: "Dashboard" } })
      .sleep(900)
      .output({
        files: [
          "app/dashboard/page.tsx",
          "components/chart-provider.tsx",
          "hooks/use-dashboard.ts",
          "components/kpi-grid.tsx",
        ],
      });
    writer.text(
      "Two problems compound. Chart library (812 KB) loads on first paint, blocking interactivity. Then the three API calls run sequentially instead of in parallel. Fix: lazy-load the chart and wrap the calls in Promise.all. Expect ~1.4s load time after this change."
    );
  });

const transport = chat.transport({ delayMs: 20 });

const EASE = [0.32, 0.72, 0, 1] as const;
const QUESTION_TEXT = "Why is the dashboard taking 4 seconds to load?";

function StatusIcon({ status }: { status?: "running" | "error" }) {
  if (status === "running") {
    return <LoaderCircleIcon className="animate-spin" />;
  }
  return status === "error" ? <CircleAlertIcon /> : <CircleCheckIcon />;
}

function Step({
  title,
  status,
  children,
  delay = 0,
}: {
  title: string;
  status?: "running" | "error";
  children?: React.ReactNode;
  delay?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const shouldShow =
    children !== undefined && children !== null && children !== false;

  React.useEffect(() => {
    if (!shouldShow) {
      return;
    }
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [shouldShow, delay]);

  const line = (
    <TraceLine status={status}>
      <TraceIcon>
        <StatusIcon status={status} />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
    </TraceLine>
  );

  if (!shouldShow) {
    return line;
  }

  return (
    <TraceCollapsible onOpenChange={setOpen} open={open}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>{children}</TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

function StepRow({
  part,
  streaming,
  delay,
}: {
  part: StepPart;
  streaming: boolean;
  delay: number;
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

  if (part.type === "tool-analyzeBundle") {
    const title =
      status === "running"
        ? `Analyzing bundle for ${part.input?.entry}`
        : status === "error"
          ? "Failed to analyze bundle"
          : `Analyzed bundle for ${part.input?.entry}`;
    return (
      <Step delay={delay} status={status} title={title}>
        {error ||
          (part.state === "output-available" && (
            <CodeBlock size="sm">
              <CodeBlockContent wrap>
                {part.output.breakdown
                  .map((item) => `${item.name.padEnd(20)} ${item.kb} KB`)
                  .join("\n")}
              </CodeBlockContent>
            </CodeBlock>
          ))}
      </Step>
    );
  }

  if (part.type === "tool-profileNetwork") {
    const title =
      status === "running"
        ? `Profiling requests on ${part.input?.route}`
        : status === "error"
          ? "Failed to profile network"
          : `Profiled requests on ${part.input?.route}`;
    return (
      <Step delay={delay} status={status} title={title}>
        {error ||
          (part.state === "output-available" && (
            <div className="flex flex-col gap-1.5 py-1">
              {part.output.requests.map((req) => (
                <div className="flex items-center gap-2 text-xs" key={req.path}>
                  <NetworkIcon className="text-muted-foreground size-3.5 shrink-0" />
                  <code className="text-muted-foreground font-mono">
                    {req.path}
                  </code>
                  <span className="text-foreground ml-auto font-mono tabular-nums">
                    {req.ms}ms
                  </span>
                </div>
              ))}
            </div>
          ))}
      </Step>
    );
  }

  const title =
    status === "running"
      ? `Scanning render tree for ${part.input?.component}`
      : status === "error"
        ? "Failed to scan render tree"
        : `Scanned render tree for ${part.input?.component}`;
  return (
    <Step delay={delay} status={status} title={title}>
      {error ||
        (part.state === "output-available" && (
          <div className="flex flex-wrap gap-1.5 py-1">
            {part.output.files.map((file) => (
              <Badge className="font-mono" key={file} variant="secondary">
                <FileCode2Icon />
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
}: {
  steps: StepPart[];
  streaming: boolean;
  answering: boolean;
}) {
  const [open, setOpen] = React.useState<boolean | undefined>();
  const [forceCollapsed, setForceCollapsed] = React.useState(false);

  const running = streaming && !answering;
  const allDone = !streaming && answering && steps.length > 0;

  React.useEffect(() => {
    if (!allDone) {
      setForceCollapsed(false);
      return;
    }
    const t = setTimeout(() => setForceCollapsed(true), 400);
    return () => clearTimeout(t);
  }, [allDone]);

  const effectiveOpen = open ?? !forceCollapsed;
  const failed = steps.filter((p) => p.state === "output-error").length;
  const status = running ? "running" : failed > 0 ? "error" : undefined;

  return (
    <Trace>
      <TraceCollapsible onOpenChange={setOpen} open={effectiveOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status={status}>
            <TraceIcon>
              <StatusIcon status={status} />
            </TraceIcon>
            <TraceTitle>
              {running
                ? "Profiling"
                : `Profiled ${steps.length} signals${failed > 0 ? `, ${failed} failed` : ""}`}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {steps.map((part, i) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 8 }}
                key={part.toolCallId}
                transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}
              >
                <StepRow delay={300} part={part} streaming={streaming} />
              </motion.div>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

export function ChainOfThoughtDemo() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: [],
    transport,
  });

  React.useEffect(() => {
    sendMessage({ text: QUESTION_TEXT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 6 }}
              key={message.id}
              transition={{ duration: 0.35, ease: EASE }}
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

        const streaming = busy && message === messages.at(-1);
        const steps = message.parts.filter(
          (p) =>
            p.type === "tool-analyzeBundle" ||
            p.type === "tool-profileNetwork" ||
            p.type === "tool-scanRenderTree"
        );
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {steps.length > 0 && (
                <ChainOfThought
                  answering={text.length > 0}
                  steps={steps}
                  streaming={streaming}
                />
              )}
              {text && (
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {text}
                </motion.p>
              )}
            </MessageContent>
          </Message>
        );
      })}
      {!busy && messages.length > 0 && (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Button
            className="mt-auto self-start"
            onClick={() => {
              setMessages([]);
              sendMessage({ text: QUESTION_TEXT });
            }}
            size="sm"
            variant="outline"
          >
            Replay
          </Button>
        </motion.div>
      )}
    </div>
  );
}
