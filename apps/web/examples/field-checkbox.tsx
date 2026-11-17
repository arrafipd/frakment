"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

export function FieldCheckbox() {
  return (
    <div className="w-full max-w-sm">
      <Field className="mx-auto w-fit" orientation="horizontal">
        <Checkbox id="terms" />
        <FieldLabel className="h-4 items-center" htmlFor="terms">
          Accept terms and conditions
        </FieldLabel>
      </Field>
    </div>
  );
}
