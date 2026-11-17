"use client";

import { NumberFlow } from "@/components/ui/number-flow";

export function NumberFlowFormat() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 py-8 text-2xl font-semibold tabular-nums">
      <NumberFlow format={{ style: "percent" }} value={0.125} />
      <NumberFlow prefix="$" value={1234} />
      <NumberFlow suffix=" km" value={1234} />
      <NumberFlow locales="de-DE" value={1234} />
    </div>
  );
}
