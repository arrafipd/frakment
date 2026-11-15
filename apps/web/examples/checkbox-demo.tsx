"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-3 [&_label]:h-4">
      <div className="flex items-center gap-2 [&>*]:shrink-0">
        <Checkbox id="c-demo" />
        <Label htmlFor="c-demo">Accept terms and conditions</Label>
      </div>
    </div>
  );
}
