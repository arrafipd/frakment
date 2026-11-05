"use client";

import { TextFlip } from "@/components/ui/text-flip";

const LINES = [
  "npm install frakment",
  "npx frakment init",
  "npx frakment add button",
  "npx frakment dev",
];

export function TextFlipTypewriter() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12">
      <div className="bg-card w-full max-w-md rounded-lg border px-4 py-3 font-mono text-sm shadow-sm">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <span className="text-emerald-500">$</span>
          <TextFlip
            as="span"
            className="text-foreground"
            interval={3.5}
            speed={70}
            variant="typewriter"
          >
            {LINES}
          </TextFlip>
        </div>
      </div>
    </div>
  );
}
