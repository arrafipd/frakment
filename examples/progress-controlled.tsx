"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

export function ProgressControlled() {
  const [value, setValue] = React.useState(50);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress className="w-full" value={value} />
      <input
        aria-label="Progress value"
        className="accent-primary h-2 w-full cursor-pointer"
        max={100}
        min={0}
        onChange={(event) => setValue(Number(event.target.value))}
        step={1}
        type="range"
        value={value}
      />
    </div>
  );
}
