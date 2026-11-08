"use client";

import { TextMorph } from "@/components/ui/text-morph";

const PHRASES = ["Focus", "Clarity", "Momentum"];

export function TextMorphBlur() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-6xl font-semibold tracking-tight sm:text-7xl">
        <TextMorph as="span" interval={2.2} variant="blur">
          {PHRASES}
        </TextMorph>
      </div>
    </div>
  );
}
