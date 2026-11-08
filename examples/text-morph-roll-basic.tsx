"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

export function TextMorphRollBasic() {
  const [count, setCount] = useState(60);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c === 0 ? 60 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12">
      <div className="text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">
        <NumberFlow
          format={{ minimumIntegerDigits: 2 }}
          prefix="0:"
          value={count}
        />
      </div>
    </div>
  );
}
