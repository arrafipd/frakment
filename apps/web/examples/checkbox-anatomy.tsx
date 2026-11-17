"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxAnatomy() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox defaultChecked id="a" />
      <label className="text-sm leading-4" htmlFor="a">
        Checked
      </label>
      <Checkbox id="b" />
      <label className="text-sm leading-4" htmlFor="b">
        Unchecked
      </label>
    </div>
  );
}
