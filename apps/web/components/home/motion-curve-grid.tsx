import { componentDefaults, tokens } from "@/lib/animation-curves";

import { MotionCurvePreview } from "./motion-curve-preview";

export function ComponentDefaultsGrid() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {componentDefaults.map((entry) => (
        <MotionCurvePreview
          copyable={false}
          entry={entry}
          heightClass="h-[200px]"
          key={entry.name}
        />
      ))}
    </div>
  );
}

export function MotionCurveGrid() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tokens.map((entry) => (
        <MotionCurvePreview entry={entry} key={entry.name} />
      ))}
    </div>
  );
}
