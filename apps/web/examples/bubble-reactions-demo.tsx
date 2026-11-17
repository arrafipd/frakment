"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/message";

export function BubbleReactionsDemo() {
  const [status, setStatus] = React.useState("idle");
  return (
    <div className="flex w-full max-w-sm flex-col gap-10 py-6">
      <Bubble align="end" variant="muted">
        <BubbleContent>
          I do not need tests, I know my code works.
        </BubbleContent>
        <BubbleReactions
          align="start"
          aria-label="Reactions: thumbs up, surprised"
          role="img"
        >
          <span>👍</span>
          <span>😮</span>
        </BubbleReactions>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>
          Bold. Fine I will add some tests. I will let you know when they are
          done.
        </BubbleContent>
        <BubbleReactions
          aria-label="Reactions: eyes, rocket, and 2 more"
          role="img"
        >
          <span>👀</span>
          <span>🚀</span>
          <span>+2</span>
        </BubbleReactions>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>
          Tests passed on the first try. All 142 of them. Looking good!
        </BubbleContent>
        <BubbleReactions
          align="start"
          aria-label="Reactions: party popper, clapping hands"
          role="img"
          side="top"
        >
          <span>🎉</span>
          <span>👏</span>
        </BubbleReactions>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>Are you sure I can run this command?</BubbleContent>
        <BubbleReactions>
          <Button
            className="rounded-full"
            onClick={() => setStatus(status === "idle" ? "confirmed" : "idle")}
            size="xs"
            variant="ghost"
          >
            {status === "idle" ? "Yes, run it" : "Confirmed"}
          </Button>
        </BubbleReactions>
      </Bubble>
    </div>
  );
}
