"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function TextareaField() {
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
        <Textarea id="feedback" placeholder="Share your thoughts..." rows={4} />
        <FieldDescription>We read every message.</FieldDescription>
      </Field>
    </div>
  );
}
