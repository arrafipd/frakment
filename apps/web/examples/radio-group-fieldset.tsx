import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupFieldset() {
  return (
    <FieldSet className="max-w-xs">
      <FieldLegend variant="label">Subscription Plan</FieldLegend>
      <FieldDescription>
        Yearly and lifetime plans offer significant savings.
      </FieldDescription>
      <RadioGroup defaultValue="monthly">
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-monthly" value="monthly" />
          <FieldLabel className="font-normal" htmlFor="plan-monthly">
            Monthly ($9.99/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-yearly" value="yearly" />
          <FieldLabel className="font-normal" htmlFor="plan-yearly">
            Yearly ($99.99/year)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-lifetime" value="lifetime" />
          <FieldLabel className="font-normal" htmlFor="plan-lifetime">
            Lifetime ($299.99)
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}
