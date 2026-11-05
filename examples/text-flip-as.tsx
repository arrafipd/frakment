"use client";

import { TextFlip } from "@/components/ui/text-flip";
import { ChevronRightIcon } from "@/lib/icons";

export function TextFlipAs() {
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-10 px-6 py-12">
      <p className="text-muted-foreground max-w-md text-center text-lg leading-relaxed text-balance">
        We help teams{" "}
        <TextFlip
          as="span"
          className="text-foreground inline-block font-medium"
          interval={2}
        >
          {["ship faster", "build smarter", "iterate daily"]}
        </TextFlip>{" "}
        with primitives that feel native to their stack.
      </p>

      <div className="bg-card w-full max-w-sm rounded-lg border p-4 font-mono text-sm">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <ChevronRightIcon className="size-3" />
          terminal
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">$</span>
          <TextFlip as="code" className="font-mono" interval={2.5}>
            {["pnpm install", "pnpm build", "pnpm dev"]}
          </TextFlip>
        </div>
      </div>

      <TextFlip
        as="p"
        className="text-muted-foreground max-w-md text-center text-base"
        interval={3}
      >
        {[
          "The default element is a paragraph.",
          "Use it for standalone sentences.",
          "Switch tags with the as prop.",
        ]}
      </TextFlip>
    </div>
  );
}
