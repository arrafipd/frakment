"use client";

import { Textarea } from "@/components/ui/textarea";

export function TextareaInvalid() {
  return (
    <div className="max-w-sm">
      <Textarea
        aria-invalid
        defaultValue="This content is not allowed."
        placeholder="Invalid"
      />
    </div>
  );
}
