"use client";

import { useChat } from "@ai-sdk/react";
import type { UIDataTypes, UIMessage } from "ai";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
} from "lucide-react";
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

type SubagentMessage = UIMessage<
  unknown,
  UIDataTypes,
  {
    runCommand: {
      input: { command: string };
      output: { stdout: string };
    };
  }
>;

type SubagentPart = SubagentMessage["parts"][number];

type ChatMessage = UIMessage<
  unknown,
  UIDataTypes,
  {
    researchAgent: {
      input: { task: string };
      output: SubagentMessage;
    };
  }
>;

type Part = ChatMessage["parts"][number];

const steps = [
  {
    command: "grep -rn cacheKey scripts",
    stdout:
      "scripts/optimize-images.ts:14:  const cacheKey = process.env.COMMIT_SHA",
  },
  {
    command: "sed -n 13,15p scripts/optimize-images.ts",
    stdout:
      'const cacheDir = ".next/cache/images"\nconst cacheKey = process.env.COMMIT_SHA\nconst cached = await restoreCache(cacheDir, cacheKey)',
  },
  {
    command: "ls public/images | wc -l",
    stdout: "1240",
  },
];

function getSubagentMessage(done: number, report?: string): SubagentMessage {
  const parts = steps.slice(0, done).map(
    (step, index): SubagentPart => ({
      input: { command: step.command },
      output: { stdout: step.stdout },
      state: "output-available",
      toolCallId: `step-${index}`,
      type: "tool-runCommand",
    })
  );

  if (done < steps.length) {
    parts.push({
      input: { command: steps[done].command },
      state: "input-available",
      toolCallId: `step-${done}`,
      type: "tool-runCommand",
    });
  }

  if (report) {
    parts.push({ text: report, type: "text" });
  }

  return { id: "research-agent", parts, role: "assistant" };
}

const chat = createChat<ChatMessage>()
  .user("Why does image optimization rerun on every deploy?")
  .assistant(({ writer }) => {
    const subagent = writer.tool("researchAgent", {
      input: {
        task: "Find out why image optimization reruns on every deploy.",
      },
    });
    writer.sleep(600);
    steps.forEach((_, index) => {
      subagent.output(getSubagentMessage(index), { preliminary: true });
      writer.sleep(1000);
    });
    subagent.output(
      getSubagentMessage(
        steps.length,
        "The cache is keyed on the commit SHA, so every deploy misses it and optimizes all 1,240 images again."
      )
    );
    writer.sleep(400);
    writer.text(
      "Image optimization reruns because its cache is keyed on the commit SHA, which changes on every deploy. Key the cache on a hash of public/images instead, and unchanged images will be skipped."
    );
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

function StepRow({
  part,
  running,
}: {
  part: Extract<SubagentPart, { type: "tool-runCommand" }>;
  running: boolean;
}) {
  const command = part.input?.command;

  if (part.state === "output-available") {
    return (
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <CircleCheckIcon />
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
    <TraceLine status={running ? "running" : "error"}>
      <TraceIcon>
        {running ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <CircleAlertIcon />
        )}
      </TraceIcon>
      <TraceTitle>
        {running ? "Running" : "Failed to run"} {command}
      </TraceTitle>
    </TraceLine>
  );
}

function SubagentRow({
  part,
  streaming,
}: {
  part: Extract<Part, { type: "tool-researchAgent" }>;
  streaming: boolean;
}) {
  const done = part.state === "output-available" && !part.preliminary;
  const running = !done && part.state !== "output-error" && streaming;
  const parts = part.state === "output-available" ? part.output.parts : [];
  const report = parts
    .map((agentPart) => (agentPart.type === "text" ? agentPart.text : ""))
    .join("");

  const line = (
    <TraceLine status={done ? undefined : running ? "running" : "error"}>
      <TraceIcon>
        {done ? (
          <CircleCheckIcon />
        ) : running ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <CircleAlertIcon />
        )}
      </TraceIcon>
      <TraceTitle>
        {done ? "Ran" : running ? "Running" : "Failed to run"} the research
        subagent
      </TraceTitle>
    </TraceLine>
  );

  if (parts.length === 0) {
    return line;
  }

  return (
    <TraceCollapsible defaultOpen>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="flex flex-col gap-3" keepMounted>
        <Trace>
          {parts.map((agentPart) =>
            agentPart.type === "tool-runCommand" ? (
              <StepRow
                key={agentPart.toolCallId}
                part={agentPart}
                running={running}
              />
            ) : null
          )}
        </Trace>
        {report && <p>{report}</p>}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function SubagentDemo() {
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
        const agents = message.parts.filter(
          (part) => part.type === "tool-researchAgent"
        );
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {agents.length > 0 && (
                <Trace>
                  {agents.map((part) => (
                    <SubagentRow
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
