"use client";

import * as React from "react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { CircleCheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ChainOfThoughtProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  done?: boolean;
}

function ChainOfThought({
  className,
  defaultOpen = true,
  done = false,
  children,
  ...props
}: ChainOfThoughtProps) {
  const [open, setOpen] = React.useState(defaultOpen || !done);

  React.useEffect(() => {
    if (done) {
      setOpen(false);
    }
  }, [done]);
  return (
    <div
      className={cn("w-full", className)}
      data-slot="chain-of-thought"
      {...props}
    >
      <Trace>
        <TraceCollapsible onOpenChange={setOpen} open={open}>
          {children}
        </TraceCollapsible>
      </Trace>
    </div>
  );
}

function ChainOfThoughtHeader({
  className,
  children = "Researched in 3 steps",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <TraceCollapsibleTrigger>
      <TraceLine>
        <TraceIcon>
          <CircleCheckIcon />
        </TraceIcon>
        <TraceTitle className={cn(className)} {...props}>
          {children}
        </TraceTitle>
      </TraceLine>
    </TraceCollapsibleTrigger>
  );
}

function ChainOfThoughtContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <TraceCollapsibleContent className={className} {...props}>
      <Trace className="pt-2">{children}</Trace>
    </TraceCollapsibleContent>
  );
}

function ChainOfThoughtStep({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <TraceLine className={className} {...props}>
      <TraceIcon>
        <CircleCheckIcon />
      </TraceIcon>
      <TraceTitle>{children}</TraceTitle>
    </TraceLine>
  );
}

export {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
};
