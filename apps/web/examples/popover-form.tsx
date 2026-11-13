"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PopoverForm() {
  return (
    <Popover>
      <PopoverTrigger as={Button} variant="outline">
        Open Popover
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="gap-4">
          <Field orientation="horizontal">
            <FieldLabel className="w-1/2" htmlFor="form-width">
              Width
            </FieldLabel>
            <Input defaultValue="100%" id="form-width" />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel className="w-1/2" htmlFor="form-height">
              Height
            </FieldLabel>
            <Input defaultValue="25px" id="form-height" />
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}
