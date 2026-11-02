"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

export function FieldCheckbox() {
  return (
    <div className="w-fit">
      <Field orientation="horizontal">
        <Checkbox id="terms" />
        <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
      </Field>
    </div>
  );
}
