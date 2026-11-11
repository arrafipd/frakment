"use client";

import { TextMorph } from "@/components/ui/text-morph";

const PHRASES = [
  "Introducing Frakment 2.0",
  "The new way to build UI",
  "Ships with agents built in",
];

export function TextMorphSlide() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        <TextMorph as="span" interval={2.4} variant="slide">
          {PHRASES}
        </TextMorph>
      </div>
    </div>
  );
}
