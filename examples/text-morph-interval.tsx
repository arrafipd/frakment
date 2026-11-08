"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextMorph } from "@/components/ui/text-morph";

const PHRASES = ["Build faster", "Ship smarter", "Scale further"];
const SPEEDS = [1, 3, 6];

export function TextMorphInterval() {
  const [interval, setInterval] = useState(3);

  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center text-5xl font-semibold tracking-tight sm:text-6xl">
        <TextMorph as="span" interval={interval} key={interval}>
          {PHRASES}
        </TextMorph>
      </div>
      <div className="flex items-center gap-2">
        {SPEEDS.map((s) => (
          <Button
            key={s}
            onClick={() => setInterval(s)}
            size="sm"
            variant={interval === s ? "default" : "outline"}
          >
            {s}s
          </Button>
        ))}
      </div>
    </div>
  );
}
