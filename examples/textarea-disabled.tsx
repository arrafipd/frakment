"use client";

import { Textarea } from "@/components/ui/textarea";

export function TextareaDisabled() {
  return (
    <div className="w-full max-w-sm">
      <Textarea
        defaultValue="This field is disabled."
        disabled
        placeholder="Disabled textarea"
      />
    </div>
  );
}
