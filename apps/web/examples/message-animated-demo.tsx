"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  MessageAnimated,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message";

interface DemoMessage {
  id: string;
  parts: Array<{ type: "text"; text: string }>;
  role: "user" | "assistant";
}

const SCRIPT: Array<{ role: "user" | "assistant"; text: string }> = [
  {
    role: "user",
    text: "How does the entrance animation work?",
  },
  {
    role: "assistant",
    text: "Each message fades in and rises 8px when it mounts. Text then streams in token by token, like a real assistant reply.",
  },
];

const INITIAL: DemoMessage[] = [
  {
    id: "u-0",
    parts: [{ text: SCRIPT[0].text, type: "text" }],
    role: "user",
  },
];

export function MessageAnimatedDemo() {
  const [messages, setMessages] = React.useState<DemoMessage[]>(INITIAL);
  const [busy, setBusy] = React.useState(false);
  const [step, setStep] = React.useState(1);

  const reset = () => {
    setMessages(INITIAL);
    setStep(1);
    setBusy(false);
  };

  const send = async () => {
    if (busy) {
      return;
    }
    if (step >= SCRIPT.length) {
      reset();
      return;
    }
    setBusy(true);
    const next = SCRIPT[step];
    const id = `${next.role === "user" ? "u" : "a"}-${step}`;
    if (next.role === "user") {
      setMessages((m) => [
        ...m,
        { id, parts: [{ text: next.text, type: "text" }], role: "user" },
      ]);
      setStep((s) => s + 1);
      await new Promise((r) => setTimeout(r, 300));
    } else {
      setMessages((m) => [
        ...m,
        { id, parts: [{ text: "", type: "text" }], role: "assistant" },
      ]);
      const tokens = next.text.split(/(\s+)/);
      let acc = "";
      for (const token of tokens) {
        await new Promise((r) => setTimeout(r, 25));
        acc += token;
        const snapshot = acc;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === id
              ? { ...msg, parts: [{ text: snapshot, type: "text" }] }
              : msg
          )
        );
      }
      setStep((s) => s + 1);
    }
    setBusy(false);
  };

  const label = busy
    ? "Streaming..."
    : step >= SCRIPT.length
      ? "Reset"
      : "Send message";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-start gap-4">
      <div className="h-64 w-full">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="p-4">
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
      <Button disabled={busy} onClick={send} size="sm" variant="outline">
        {label}
      </Button>
    </div>
  );
}
