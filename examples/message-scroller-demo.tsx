"use client";

import * as React from "react";
import { PlusIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    text: "What's the build time for the dashboard route?",
  },
  {
    id: "2",
    role: "assistant",
    text: "The dashboard route builds in 1.8s on average. Breakdown:\n\n- Bundle: 1240 KB\n- 3 network requests on /dashboard: 620ms\n- Render tree scan: 180ms\n\nWant me to profile /settings next?",
  },
  {
    id: "3",
    role: "user",
    text: "Yes, and also check the API latency.",
  },
  {
    id: "4",
    role: "assistant",
    text: "Settings builds in 2.1s. API latency (p95):\n\n- /api/status: 42ms\n- /api/registry: 118ms\n- /api/search: 340ms",
  },
];

const turnPool: Array<[ChatMessage, ChatMessage]> = [
  [
    { id: "t1", role: "user", text: "Any regressions since last week?" },
    {
      id: "t2",
      role: "assistant",
      text: "No regressions in bundle size. The registry endpoint gained 12ms — likely the new skill manifest payload.",
    },
  ],
  [
    { id: "t3", role: "user", text: "Which endpoint has the worst p95?" },
    {
      id: "t4",
      role: "assistant",
      text: "Worst p95 is /api/search at 340ms. 80% of that is the fuzzy matcher. Caching common queries would cut it in half.",
    },
  ],
  [
    { id: "t5", role: "user", text: "Write it up and I'll pick it up tomorrow." },
    {
      id: "t6",
      role: "assistant",
      text: "Drafted. Summary:\n\n- 3 endpoints profiled\n- 1 regression flagged (registry payload)\n- 1 optimization suggested (cache /api/search)\n\nSaved as profile-2026-11-02.md.",
    },
  ],
];

export function MessageScrollerDemo() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [turn, setTurn] = React.useState(0);

  const addTurn = () => {
    const pair = turnPool[turn % turnPool.length];
    setMessages((prev) => [...prev, ...pair]);
    setTurn((t) => t + 1);
  };

  const reset = () => {
    setMessages(initialMessages);
    setTurn(0);
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative h-[420px] overflow-hidden rounded-lg border bg-background">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="p-4">
                {messages.map((m) => (
                  <MessageScrollerItem
                    key={m.id}
                    scrollAnchor={m.role === "user"}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                        m.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {m.text}
                    </div>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={addTurn}>
          <PlusIcon /> Add turn
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcwIcon /> Reset
        </Button>
      </div>
    </div>
  );
}