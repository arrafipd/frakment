"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion, useReducedMotion } from "motion/react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent } from "@/components/ui/message";
import { createChat, getMessageText } from "@/lib/ai";
import { MESSAGE_ANIMATIONS } from "@/lib/message-animations";

type ChatMessage = UIMessage<
  unknown,
  {
    checkpoint: {
      label: string;
    };
  }
>;

type CheckpointPart = Extract<
  ChatMessage["parts"][number],
  { type: "data-checkpoint" }
>;

const chat = createChat<ChatMessage>()
  .user("Rename the button component to action.")
  .assistant(({ writer }) => {
    writer.text("Renamed Button to Action in components/ui/button.tsx.");
    writer.data({
      data: { label: "Button renamed" },
      id: "rename",
      type: "data-checkpoint",
    });
  })
  .user("Update the docs to match.")
  .assistant(({ writer }) => {
    writer.text("Updated the Button page to say Action.");
  });

const transcript = chat.get();
const transport = chat.transport({ delayMs: 20 });

export function CheckpointDemo() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: transcript,
    transport,
  });
  const shouldReduceMotion = useReducedMotion();
  const nextMessage = chat.next(messages);
  const busy = status === "submitted" || status === "streaming";

  function restore(messageId: string) {
    const index = messages.findIndex((message) => message.id === messageId);

    if (index === -1) {
      return;
    }

    setMessages(messages.slice(0, index + 1));
  }

  return (
    <div className="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {messages.map((message) => {
        const checkpoint = message.parts.find(
          (part): part is CheckpointPart => part.type === "data-checkpoint"
        );
        const index = messages.findIndex((item) => item.id === message.id);
        const canRestore = index < messages.length - 1;

        return (
          <motion.div
            animate={shouldReduceMotion ? undefined : "animate"}
            className="flex flex-col gap-4"
            initial={shouldReduceMotion ? undefined : "initial"}
            key={message.id}
            variants={MESSAGE_ANIMATIONS["slide-up"].variants}
          >
            {message.role === "user" ? (
              <Message align="end">
                <MessageContent>
                  <Bubble align="end" variant="muted">
                    <BubbleContent>{getMessageText(message)}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            ) : (
              <Message>
                <MessageContent>
                  <p>{getMessageText(message)}</p>
                </MessageContent>
              </Message>
            )}
            {checkpoint && (
              <motion.div
                animate={shouldReduceMotion ? undefined : "animate"}
                initial={shouldReduceMotion ? undefined : "initial"}
                variants={MESSAGE_ANIMATIONS.fade.variants}
              >
                <Marker variant="separator">
                  <MarkerContent className="inline-flex items-center gap-2">
                    {checkpoint.data.label}
                    {canRestore && (
                      <Button
                        aria-label={`Restore to ${checkpoint.data.label}`}
                        className="h-6 rounded-full px-2.5 text-xs"
                        onClick={() => restore(message.id)}
                        size="sm"
                        variant="outline"
                      >
                        Restore
                      </Button>
                    )}
                  </MarkerContent>
                </Marker>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      {!busy && nextMessage && (
        <Button
          className="mt-auto self-start"
          onClick={() => sendMessage(nextMessage)}
          size="sm"
          variant="outline"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
