"use client";

import { Textarea } from "@/components/ui/textarea";

export function TextareaDisabled() {
  return (
    <div className="w-full max-w-sm">
      <Textarea
        placeholder="Disabled textarea"
        disabled
        defaultValue="This field is disabled."
      />
    </div>
  );
}