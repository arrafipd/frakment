"use client";

import { TextFlip } from "@/components/ui/text-flip";

const VALUES = ["+128", "+384", "+1024"];

export function TextFlipScale() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
        <span className="text-muted-foreground">Downloads</span>
        <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-500 tabular-nums">
          <TextFlip as="span" interval={1.8} variant="scale">
            {VALUES}
          </TextFlip>
        </span>
      </div>
    </div>
  );
}
