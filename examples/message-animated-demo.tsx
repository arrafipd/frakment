"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { MessageAnimated } from "@/components/ui/message-animated";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { createChat } from "@/lib/ai";

const chat = createChat()
  .user("How does the entrance animation work?")
  .sleep(200)
  .assistant(
    "Each message fades in and rises 8px when it mounts. Text then streams in token by token, like a real assistant reply."
  );

const initialMessages = chat.get(0);
const transport = chat.transport({ delayMs: 20 });

export function MessageAnimatedDemo() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages,
    transport,
  });
  const nextMessage = chat.next(messages);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-start gap-4">
      <div className="h-64 w-full">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent aria-busy={busy} className="p-4">
                {messages.map((message) => (
                  <MessageAnimated
                    key={message.id}
                    message={message}
                    scrollAnchor={message.role === "user"}
                  />
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      {!busy && (
        <Button
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
