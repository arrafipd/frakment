"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export function ProgressControlled() {
  const [value, setValue] = React.useState(50);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress className="w-full" value={value} />
      <Slider
        aria-label="Progress value"
        className="w-full"
        max={100}
        min={0}
        onValueChange={(value) => setValue(value[0])}
        step={1}
        value={[value]}
      />
    </div>
  );
}
