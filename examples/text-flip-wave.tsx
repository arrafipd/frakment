"use client";

import { TextFlip } from "@/components/ui/text-flip";

const PHRASES = [
  "Build something people love",
  "Ship without the boilerplate",
  "Iterate at the speed of thought",
];

export function TextFlipWave() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        <TextFlip as="span" interval={3.5} speed={35} variant="wave">
          {PHRASES}
        </TextFlip>
      </div>
    </div>
  );
}
