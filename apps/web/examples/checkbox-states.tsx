"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxStates() {
  return (
    <div className="flex items-center gap-4">
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Indeterminate" checked="indeterminate" />
    </div>
  );
}
