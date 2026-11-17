"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxWithLabel() {
  return (
    <div className="flex flex-col gap-3 [&_label]:h-4">
      <div className="flex items-center gap-2 [&>*]:shrink-0">
        <Checkbox defaultChecked id="c-a" />
        <Label htmlFor="c-a">Email notifications</Label>
      </div>
      <div className="flex items-center gap-2 [&>*]:shrink-0">
        <Checkbox id="c-b" />
        <Label htmlFor="c-b">SMS notifications</Label>
      </div>
    </div>
  );
}
