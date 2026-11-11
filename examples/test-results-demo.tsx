"use client";

import { useChat } from "@ai-sdk/react";
import type { UIDataTypes, UIMessage } from "ai";
import {
  CheckIcon,
  CircleDashedIcon,
  FileCodeIcon,
  FlaskConicalIcon,
  XIcon,
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

interface Test {
  error?: string;
  name: string;
  status: "passed" | "failed" | "skipped";
}

type ChatMessage = UIMessage<
  unknown,
  UIDataTypes,
  {
    runTests: {
      input: { command: string };
      output: { suites: { name: string; tests: Test[] }[] };
    };
  }
>;

type ToolPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-runTests" }
>;

const chat = createChat<ChatMessage>()
  .user("Run the checkout tests.")
  .assistant(({ writer }) => {
    writer
      .tool("runTests", { input: { command: "pnpm test checkout" } })
      .sleep(1500)
      .output({
        suites: [
          {
            name: "cart.test.ts",
            tests: [
              { name: "adds an item", status: "passed" },
              { name: "removes an item", status: "passed" },
              { name: "applies a discount code", status: "passed" },
            ],
          },
          {
            name: "payment.test.ts",
            tests: [
              { name: "charges the saved card", status: "passed" },
              {
                error: `Expected 2 charge attempts, received 1

  at Object.<anonymous> (src/payment.test.ts:58:22)`,
                name: "retries a declined card",
                status: "failed",
              },
            ],
          },
        ],
      });
    writer.text(
      "One test failed. The payment client does not retry a declined card, so the second charge attempt never happens."
    );
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

function countTests(tests: Test[]) {
  return {
    failed: tests.filter((test) => test.status === "failed").length,
    skipped: tests.filter((test) => test.status === "skipped").length,
    total: tests.length,
  };
}

function formatCounts({
  total,
  failed,
  skipped,
}: ReturnType<typeof countTests>) {
  return [
    `${total} tests`,
    failed > 0 && `${failed} failed`,
    skipped > 0 && `${skipped} skipped`,
  ]
    .filter(Boolean)
    .join(", ");
}

function TestRow({ test }: { test: Test }) {
  if (test.status === "failed") {
    return (
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <XIcon />
            </TraceIcon>
            <TraceTitle>{test.name}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm">
            <CodeBlockContent className="max-h-64" wrap>
              {test.error}
            </CodeBlockContent>
          </CodeBlock>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    );
  }

  return (
    <TraceLine>
      <TraceIcon>
        {test.status === "skipped" ? <CircleDashedIcon /> : <CheckIcon />}
      </TraceIcon>
      <TraceTitle>
        {test.status === "skipped" ? `Skipped ${test.name}` : test.name}
      </TraceTitle>
    </TraceLine>
  );
}

function TestResultsRow({
  part,
  streaming,
}: {
  part: ToolPart;
  streaming: boolean;
}) {
  const command = part.input?.command;

  if (part.state !== "output-available") {
    const running = streaming && part.state !== "output-error";

    return (
      <TraceLine status={running ? "running" : "error"}>
        <TraceIcon>
          <FlaskConicalIcon />
        </TraceIcon>
        <TraceTitle>
          {running ? "Running" : "Failed to run"} {command}
        </TraceTitle>
      </TraceLine>
    );
  }

  const { suites } = part.output;
  const summary = countTests(suites.flatMap((suite) => suite.tests));

  return (
    <TraceCollapsible defaultOpen={summary.failed > 0}>
      <TraceCollapsibleTrigger>
        <TraceLine status={summary.failed > 0 ? "error" : undefined}>
          <TraceIcon>
            <FlaskConicalIcon />
          </TraceIcon>
          <TraceTitle>Ran {formatCounts(summary)}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent keepMounted>
        <Trace>
          {suites.map((suite) => {
            const counts = countTests(suite.tests);

            return (
              <TraceCollapsible
                defaultOpen={counts.failed > 0}
                key={suite.name}
              >
                <TraceCollapsibleTrigger>
                  <TraceLine status={counts.failed > 0 ? "error" : undefined}>
                    <TraceIcon>
                      <FileCodeIcon />
                    </TraceIcon>
                    <TraceTitle>
                      {suite.name}, {formatCounts(counts)}
                    </TraceTitle>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent keepMounted>
                  <Trace>
                    {suite.tests.map((test) => (
                      <TestRow key={test.name} test={test} />
                    ))}
                  </Trace>
                </TraceCollapsibleContent>
              </TraceCollapsible>
            );
          })}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function TestResultsDemo() {
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
          (part) => part.type === "tool-runTests"
        );
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {tools.length > 0 && (
                <Trace>
                  {tools.map((part) => (
                    <TestResultsRow
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
