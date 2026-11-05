"use client";

import { ChevronRightIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextFlip } from "@/components/ui/text-flip";

const PHRASES = ["ship faster", "build smarter", "iterate daily"];

export function TextFlipDemo() {
  return (
    <div className="flex min-h-[380px] w-full flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Badge variant="outline">
        <SparklesIcon />
        v2.0 is out
      </Badge>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        The component library for teams that{" "}
        <TextFlip as="span" className="inline-block" interval={2}>
          {PHRASES}
        </TextFlip>
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>
          Get started
          <ChevronRightIcon />
        </Button>
        <Button variant="outline">Documentation</Button>
      </div>
    </div>
  );
}
