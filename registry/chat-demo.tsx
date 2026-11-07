"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  ArrowUpIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
  TerminalIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Markdown } from "@/components/ui/markdown";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { MESSAGE_ANIMATIONS } from "@/lib/message-animations";

type ChatMessage = UIMessage<
  unknown,
  { output: string },
  { runCommand: { input: { command: string }; output: { stdout: string } } }
>;

type ToolPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-runCommand" }
>;

const chat = createChat<ChatMessage>()
  .user("Add a dark mode toggle to the settings page.")
  .assistant(({ writer }) => {
    writer.reasoning(
      "I need to check how themes are set up before adding a toggle. If next-themes is already in the layout, the toggle only has to call setTheme."
    );
    writer.sleep(300);
    const check = writer.tool("runCommand", {
      input: { command: "rg -l ThemeProvider app" },
    });
    writer.sleep(500);
    check.output({ stdout: "app/layout.tsx" });
    writer.sleep(300);
    writer.text(
      "next-themes is already set up in `app/layout.tsx`, so the toggle only has to call `setTheme`.\n\n**Changes**\n\n- Added `components/mode-toggle.tsx` with Light and Dark options.\n- Placed `<ModeToggle />` next to the Appearance heading."
    );
  })
  .user("Make it follow the system setting by default.")
  .assistant(({ writer }) => {
    writer.reasoning(
      "The default theme lives on the ThemeProvider. I should check what it is set to now."
    );
    writer.sleep(300);
    const check = writer.tool("runCommand", {
      input: { command: "rg -n defaultTheme app/layout.tsx" },
    });
    writer.sleep(500);
    check.output({
      stdout: '12:  <ThemeProvider attribute="class" defaultTheme="light">',
    });
    writer.sleep(300);
    writer.text(
      "It was set to `light`. I updated the `ThemeProvider` to use `system` with `enableSystem` enabled.\n\nNew visitors now get their OS preference, and anyone who picked a fixed theme can switch back."
    );
  });

const transcript = chat.get();
const transport = chat.transport({ delayMs: 16 });

export function ChatDemo() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: transcript,
    transport,
  });
  const [draft, setDraft] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const busy = status === "submitted" || status === "streaming";
  const canSend = draft.trim().length > 0 && !busy;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    void sendMessage({ text: draft.trim() });
    setDraft("");
  }

  return (
    <MessageScrollerProvider>
      <div className="bg-background flex h-[640px] w-full flex-col rounded-lg border">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-medium">New Thread</div>
            <div className="text-muted-foreground text-xs">
              Ask the agent to change your code.
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Reset conversation"
                disabled={busy}
                onClick={() => {
                  setMessages(transcript);
                  setDraft("");
                }}
                size="icon"
                variant="outline"
              >
                <RotateCwIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset</TooltipContent>
          </Tooltip>
        </div>
        <div className="min-h-0 flex-1">
          {messages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>What should we build?</EmptyTitle>
                <EmptyDescription>
                  The agent can read your code, run commands, and make changes.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent aria-busy={busy} className="gap-4 p-4">
                  {messages.map((message) => {
                    if (message.role === "user") {
                      return (
                        <MessageScrollerItem
                          key={message.id}
                          messageId={message.id}
                          scrollAnchor
                        >
                          <motion.div
                            animate={shouldReduceMotion ? undefined : "animate"}
                            initial={shouldReduceMotion ? undefined : "initial"}
                            variants={MESSAGE_ANIMATIONS["slide-up"].variants}
                          >
                            <Message align="end">
                              <MessageContent>
                                <Bubble align="end" variant="muted">
                                  <BubbleContent>
                                    {getMessageText(message)}
                                  </BubbleContent>
                                </Bubble>
                              </MessageContent>
                            </Message>
                          </motion.div>
                        </MessageScrollerItem>
                      );
                    }

                    const streaming = busy && message === messages.at(-1);
                    const steps = message.parts.filter(
                      (part) =>
                        part.type === "reasoning" ||
                        part.type === "tool-runCommand"
                    );
                    const reply = getMessageText(message);

                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                      >
                        <motion.div
                          animate={shouldReduceMotion ? undefined : "animate"}
                          initial={shouldReduceMotion ? undefined : "initial"}
                          variants={MESSAGE_ANIMATIONS.fade.variants}
                        >
                          <Message>
                            <MessageContent className="gap-3">
                              {steps.length > 0 && (
                                <Trace>
                                  {steps.map((part, index) => (
                                    <StepRow
                                      key={index}
                                      part={part}
                                      streaming={streaming}
                                    />
                                  ))}
                                </Trace>
                              )}
                              {reply && <Markdown>{reply}</Markdown>}
                            </MessageContent>
                          </Message>
                        </motion.div>
                      </MessageScrollerItem>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </div>
        <div className="border-t p-4">
          <form className="w-full" onSubmit={onSubmit} ref={formRef}>
            <InputGroup>
              <InputGroupTextarea
                aria-label="Message"
                className="min-h-14"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
                placeholder="Ask the agent..."
                value={draft}
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <InputGroupButton
                  aria-label="Send"
                  className="ml-auto"
                  disabled={!canSend}
                  size="icon-sm"
                  type="submit"
                  variant="default"
                >
                  <ArrowUpIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

function StepRow({
  part,
  streaming,
}: {
  part: ChatMessage["parts"][number];
  streaming: boolean;
}) {
  if (part.type === "reasoning") {
    return (
      <ReasoningRow running={part.state === "streaming"} text={part.text} />
    );
  }

  if (part.type === "tool-runCommand") {
    return <ToolRow part={part} streaming={streaming} />;
  }

  return null;
}

function ReasoningRow({ text, running }: { text: string; running: boolean }) {
  const [open, setOpen] = React.useState<boolean>();

  return (
    <TraceCollapsible onOpenChange={setOpen} open={open ?? running}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>
            {running ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <CircleCheckIcon />
            )}
          </TraceIcon>
          <TraceTitle>{running ? "Thinking" : "Thought"}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

function ToolRow({ part, streaming }: { part: ToolPart; streaming: boolean }) {
  const command = part.input?.command;

  if (part.state === "output-available" || part.state === "output-error") {
    const failed = part.state === "output-error";

    return (
      <TraceCollapsible>
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
              {failed ? part.errorText : part.output.stdout}
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
