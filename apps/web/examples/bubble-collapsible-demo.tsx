"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Bubble, BubbleContent } from "@/components/ui/message";

const text =
  "The accessibility review found two focus states that were visually too subtle in dark mode. I checked the dialog, menu, and drawer paths because each one renders focusable controls inside a layered surface. The dialog and drawer are fine. The menu needs the hover and focus tokens split so keyboard focus stays visible when the pointer is not involved.";

const previewLength = 180;

export function BubbleCollapsibleDemo() {
  const [open, setOpen] = React.useState(false);
  const isLong = text.length > previewLength;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 py-6">
      <Bubble variant="muted">
        <BubbleContent>How can I help you today?</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="muted">
        <BubbleContent>
          <Collapsible onOpenChange={setOpen} open={open}>
            <div>
              {text.slice(0, previewLength)}
              {!open && isLong ? "..." : ""}
            </div>
            {isLong ? (
              <CollapsibleContent>
                {text.slice(previewLength)}
              </CollapsibleContent>
            ) : null}
            {isLong ? (
              <CollapsibleTrigger
                as={Button}
                className="text-muted-foreground mt-2 h-auto gap-1 p-0 [&[data-state=open]>svg]:rotate-180"
                variant="link"
              >
                {open ? "Show less" : "Show more"}
                <ChevronDownIcon className="size-3 transition-transform" />
              </CollapsibleTrigger>
            ) : null}
          </Collapsible>
        </BubbleContent>
      </Bubble>
    </div>
  );
}
