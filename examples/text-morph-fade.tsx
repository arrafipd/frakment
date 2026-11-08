"use client";

import { TextMorph } from "@/components/ui/text-morph";

const PHRASES = [
  "Crafted with care",
  "Designed for clarity",
  "Built for speed",
];

export function TextMorphFade() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
        <TextMorph as="span" interval={2.2} variant="fade">
          {PHRASES}
        </TextMorph>
      </div>
    </div>
  );
}
