"use client";

import { TextFlip } from "@/components/ui/text-flip";

const PHRASES = [
  "Crafted with care",
  "Designed for clarity",
  "Built for speed",
];

export function TextFlipFade() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
        <TextFlip as="span" interval={2.2} variant="fade">
          {PHRASES}
        </TextFlip>
      </div>
    </div>
  );
}
