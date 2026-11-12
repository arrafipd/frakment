"use client";

import { Textarea } from "@/components/ui/textarea";

export function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Textarea placeholder="Write a message..." />
      <Textarea placeholder="Reply..." rows={3} />
      <Textarea defaultValue="Cannot edit" disabled placeholder="Disabled" />
      <Textarea
        aria-invalid
        defaultValue="Invalid value"
        placeholder="Invalid"
      />
    </div>
  );
}
