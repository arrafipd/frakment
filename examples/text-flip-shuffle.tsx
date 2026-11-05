"use client";

import { TextFlip } from "@/components/ui/text-flip";

const PHRASES = ["Hi", "Ship it", "Ship to production"];

export function TextFlipShuffle() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
        <TextFlip as="span" interval={2.2} variant="shuffle">
          {PHRASES}
        </TextFlip>
      </div>
    </div>
  );
}
