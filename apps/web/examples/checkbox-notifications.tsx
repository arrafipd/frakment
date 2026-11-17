"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxNotifications() {
  return (
    <div className="mx-auto max-w-sm space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked id="email" />
        <label className="text-sm leading-4" htmlFor="email">
          Email notifications
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="push" />
        <label className="text-sm leading-4" htmlFor="push">
          Push notifications
        </label>
      </div>
    </div>
  );
}
