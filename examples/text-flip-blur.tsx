"use client";

import { TextFlip } from "@/components/ui/text-flip";

const PHRASES = ["Focus", "Clarity", "Momentum"];

export function TextFlipBlur() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-6xl font-semibold tracking-tight sm:text-7xl">
        <TextFlip as="span" interval={2.2} variant="blur">
          {PHRASES}
        </TextFlip>
      </div>
    </div>
  );
}
