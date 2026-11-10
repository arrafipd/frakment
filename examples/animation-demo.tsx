"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function DemoBlock({
  animation,
  label,
}: {
  animation?: false | string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <Accordion
        animation={animation}
        className="w-full"
        collapsible
        defaultValue="a"
        type="single"
      >
        <AccordionItem value="a">
          <AccordionTrigger>Click to expand</AccordionTrigger>
          <AccordionContent>
            This content reveals with the configured animation.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AnimationDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <DemoBlock label="Default (no animation prop)" />
      <DemoBlock
        animation="spring(300, 25)"
        label='animation="spring(300, 25)"'
      />
      <DemoBlock
        animation="easeInOut 300ms"
        label='animation="easeInOut 300ms"'
      />
      <DemoBlock animation={false} label="animation={false}" />
    </div>
  );
}
