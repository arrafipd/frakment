import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupInvalid() {
  return (
    <FieldSet className="max-w-xs">
      <FieldLegend variant="label">Notification Preferences</FieldLegend>
      <FieldDescription>
        Choose how you want to receive notifications.
      </FieldDescription>
      <RadioGroup defaultValue="email">
        <Field data-invalid orientation="horizontal">
          <RadioGroupItem aria-invalid id="invalid-email" value="email" />
          <FieldLabel className="font-normal" htmlFor="invalid-email">
            Email only
          </FieldLabel>
        </Field>
        <Field data-invalid orientation="horizontal">
          <RadioGroupItem aria-invalid id="invalid-sms" value="sms" />
          <FieldLabel className="font-normal" htmlFor="invalid-sms">
            SMS only
          </FieldLabel>
        </Field>
        <Field data-invalid orientation="horizontal">
          <RadioGroupItem aria-invalid id="invalid-both" value="both" />
          <FieldLabel className="font-normal" htmlFor="invalid-both">
            Both Email & SMS
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}
