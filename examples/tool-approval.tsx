"use client";

import { useChat } from "@ai-sdk/react";
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { CircleCheckIcon, LoaderCircleIcon, TerminalIcon } from "lucide-react";
import * as React from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
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

const chat = createChat<ChatMessage>()
  .user("Clean up the build folder.")
  .sleep(600)
  .assistant(({ writer }) => {
    writer.reasoning(
      "The build output lives in dist. Deleting it cannot be undone, so I should ask before I run the command."
    );
    writer.sleep(400);
    writer.tool("runCommand", {
      input: { command: "rm -rf dist" },
      needsApproval: true,
      output: { stdout: "" },
    });
  })
  .assistant(({ writer, toolCall }) => {
    writer.sleep(600);
    writer.text(
      toolCall?.approved
        ? "Removed the dist folder."
        : "Okay, I left the dist folder in place."
    );
  });

const initialMessages = chat.get(0);
const transport = chat.transport({ delayMs: 20 });

export function ToolApproval() {
  const {
    messages,
    sendMessage,
    setMessages,
    status,
    addToolApprovalResponse,
  } = useChat({
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    transport,
  });
  const nextMessage = chat.next(messages);
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

        return (
          <Message key={message.id}>
            <MessageContent className="gap-4">
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <p key={index}>{part.text}</p>;
                }

                if (part.type === "reasoning") {
                  return (
                    <Trace key={index}>
                      <ReasoningLine
                        running={part.state === "streaming"}
                        text={part.text}
                      />
                    </Trace>
                  );
                }

                if (part.type !== "tool-runCommand") {
                  return null;
                }

                if (part.state === "approval-requested") {
                  return (
                    <Item key={part.toolCallId} variant="outline">
                      <ItemMedia>
                        <TerminalIcon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Run {part.input.command}?</ItemTitle>
                        <ItemDescription>
                          The command runs in this project.
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          onClick={() =>
                            addToolApprovalResponse({
                              approved: false,
                              id: part.approval.id,
                            })
                          }
                          size="sm"
                          variant="outline"
                        >
                          Deny
                        </Button>
                        <Button
                          onClick={() =>
                            addToolApprovalResponse({
                              approved: true,
                              id: part.approval.id,
                            })
                          }
                          size="sm"
                        >
                          Approve
                        </Button>
                      </ItemActions>
                    </Item>
                  );
                }

                const denied =
                  part.state === "output-denied" ||
                  (part.state === "approval-responded" &&
                    !part.approval.approved);

                return (
                  <Trace key={part.toolCallId}>
                    <TraceLine
                      status={
                        !denied && part.state !== "output-available"
                          ? "running"
                          : undefined
                      }
                    >
                      <TraceIcon>
                        <TerminalIcon />
                      </TraceIcon>
                      <TraceTitle>
                        {denied
                          ? "Denied"
                          : part.state === "output-available"
                            ? "Ran"
                            : "Running"}{" "}
                        {part.input?.command}
                      </TraceTitle>
                    </TraceLine>
                  </Trace>
                );
              })}
            </MessageContent>
          </Message>
        );
      })}
      {!busy && (
        <Button
          className="mt-auto self-start"
          onClick={() =>
            nextMessage
              ? sendMessage(nextMessage)
              : setMessages(initialMessages)
          }
          size="sm"
          variant="outline"
        >
          {nextMessage ? "Send message" : "Reset"}
        </Button>
      )}
    </div>
  );
}

function ReasoningLine({ text, running }: { text: string; running: boolean }) {
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
      <TraceCollapsibleContent className="text-muted-foreground whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
