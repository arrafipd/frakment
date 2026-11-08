"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function FieldSwitch() {
  return (
    <div className="w-fit">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Share across devices</FieldTitle>
          <FieldDescription>
            Focused settings sync between devices.
          </FieldDescription>
        </FieldContent>
        <Switch id="sync" />
      </Field>
    </div>
  );
}
