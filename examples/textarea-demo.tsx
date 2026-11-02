"use client";

import { Textarea } from "@/components/ui/textarea";

export function TextareaDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Textarea placeholder="Write a message..." />
      <Textarea placeholder="Disabled" disabled />
      <Textarea placeholder="Invalid" aria-invalid />
    </div>
  );
}
