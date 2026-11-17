"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { NumberFlow } from "@/components/ui/number-flow";

export function NumberFlowDemo() {
  const [count, setCount] = useState(60);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c === 0 ? 60 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const reset = () => setCount(60);

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-start gap-6">
        <div className="text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">
          <NumberFlow
            format={{ minimumIntegerDigits: 2 }}
            prefix="0:"
            value={count}
          />
        </div>
        <Button onClick={reset} size="sm" variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
}
