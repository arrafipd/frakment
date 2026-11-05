"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

const VALUES = [12_480, 48_210, 92_405, 163_890, 248_750];

export function TextFlipCount() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % VALUES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 py-12">
      <div className="text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl">
        <NumberFlow prefix="$" value={VALUES[index]} />
      </div>
    </div>
  );
}
