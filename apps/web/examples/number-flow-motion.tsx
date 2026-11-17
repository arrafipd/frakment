"use client";

import { useEffect, useState } from "react";

import { NumberFlow } from "@/components/ui/number-flow";

export function NumberFlowMotion() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v + 1) % 100);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-3 items-center gap-6 px-6 py-8">
      <div className="flex flex-col items-center gap-1">
        <span className="text-muted-foreground text-xs font-medium">
          default (900ms)
        </span>
        <div className="text-3xl font-semibold tabular-nums">
          <NumberFlow value={value} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-muted-foreground text-xs font-medium">
          200 ease-out
        </span>
        <div className="text-3xl font-semibold tabular-nums">
          <NumberFlow motion="200 ease-out" value={value} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-muted-foreground text-xs font-medium">off</span>
        <div className="text-3xl font-semibold tabular-nums">
          <NumberFlow motion="off" value={value} />
        </div>
      </div>
    </div>
  );
}
