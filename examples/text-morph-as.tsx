"use client";

import { ChevronRightIcon } from "lucide-react";
import { TextMorph } from "@/components/ui/text-morph";

export function TextMorphAs() {
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-10 px-6 py-12">
      <p className="text-muted-foreground max-w-md text-center text-lg leading-relaxed text-balance">
        We help teams{" "}
        <TextMorph
          as="span"
          className="text-foreground inline-block font-medium"
          interval={2}
        >
          {["ship faster", "build smarter", "iterate daily"]}
        </TextMorph>{" "}
        with primitives that feel native to their stack.
      </p>

      <div className="bg-card w-full max-w-sm rounded-lg border p-4 font-mono text-sm">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <ChevronRightIcon className="size-3" />
          terminal
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">$</span>
          <TextMorph as="code" className="font-mono" interval={2.5}>
            {["pnpm install", "pnpm build", "pnpm dev"]}
          </TextMorph>
        </div>
      </div>

      <TextMorph
        as="p"
        className="text-muted-foreground max-w-md text-center text-base"
        interval={3}
      >
        {[
          "The default element is a paragraph.",
          "Use it for standalone sentences.",
          "Switch tags with the as prop.",
        ]}
      </TextMorph>
    </div>
  );
}
