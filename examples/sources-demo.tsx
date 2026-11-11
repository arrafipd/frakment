"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ArrowUpRightIcon, GlobeIcon } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
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

const chat = createChat()
  .user("How do I start an Astro project with pnpm?")
  .assistant(({ writer }) => {
    writer.text(
      "Run pnpm create astro@latest and follow the prompts. It scaffolds the project and installs the dependencies."
    );
    writer.sourceUrl({
      title: "Install Astro | docs.astro.build",
      url: "https://docs.astro.build/en/install-and-setup/",
    });
    writer.sourceUrl({
      title: "create-astro | npmjs.com",
      url: "https://www.npmjs.com/package/create-astro",
    });
    writer.sourceUrl({
      title: "Install Astro | docs.astro.build",
      url: "https://docs.astro.build/en/install-and-setup/",
    });
    writer.sourceUrl({
      title: "pnpm create | pnpm.io",
      url: "https://pnpm.io/cli/create",
    });
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

type SourcePart = Extract<UIMessage["parts"][number], { type: "source-url" }>;

function Sources({ sources }: { sources: SourcePart[] }) {
  return (
    <Trace>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <GlobeIcon />
            </TraceIcon>
            <TraceTitle>{`Used ${sources.length} sources`}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {sources.map((source) => (
              <a
                className="decoration-muted-foreground block rounded-md underline-offset-4 hover:underline"
                href={source.url}
                key={source.url}
                rel="noreferrer"
                target="_blank"
              >
                <TraceLine>
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
    </Trace>
  );
}

export function SourcesDemo() {
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

        const sources = message.parts
          .filter((part) => part.type === "source-url")
          .filter(
            (part, index, all) =>
              all.findIndex((other) => other.url === part.url) === index
          );
        const text = getMessageText(message);

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {text && <p>{text}</p>}
              {sources.length > 0 && <Sources sources={sources} />}
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
