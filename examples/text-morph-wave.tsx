"use client";

import { TextMorph } from "@/components/ui/text-morph";

const PHRASES = [
  "Build something people love",
  "Ship without the boilerplate",
  "Iterate at the speed of thought",
];

export function TextMorphWave() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        <TextMorph as="span" interval={3.5} speed={35} variant="wave">
          {PHRASES}
        </TextMorph>
      </div>
    </div>
  );
}
