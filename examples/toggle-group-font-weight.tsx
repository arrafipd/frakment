"use client";

import * as React from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleGroupFontWeightSelector() {
  const [fontWeight, setFontWeight] = React.useState("normal");
  return (
    <Field>
      <FieldLabel>Font Weight</FieldLabel>
      <ToggleGroup
        onValueChange={(value) => {
          if (value) {
            setFontWeight(value);
          }
        }}
        size="lg"
        spacing={2}
        type="single"
        value={fontWeight}
        variant="outline"
      >
        <ToggleGroupItem
          aria-label="Light"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="light"
        >
          <span className="text-2xl leading-none font-light">Aa</span>
          <span className="text-muted-foreground text-xs">Light</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Normal"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="normal"
        >
          <span className="text-2xl leading-none font-normal">Aa</span>
          <span className="text-muted-foreground text-xs">Normal</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Medium"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="medium"
        >
          <span className="text-2xl leading-none font-medium">Aa</span>
          <span className="text-muted-foreground text-xs">Medium</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Bold"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="bold"
        >
          <span className="text-2xl leading-none font-bold">Aa</span>
          <span className="text-muted-foreground text-xs">Bold</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <FieldDescription>
        Use{" "}
        <code className="bg-muted rounded-md px-1 py-0.5 font-mono">
          font-{fontWeight}
        </code>{" "}
        to set the font weight.
      </FieldDescription>
    </Field>
  );
}
