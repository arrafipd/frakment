"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FieldSelect() {
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="fruit">Favorite fruit</FieldLabel>
        <Select>
          <SelectTrigger id="fruit">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Choose one from the list.</FieldDescription>
      </Field>
    </div>
  );
}
