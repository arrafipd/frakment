"use client";

import { CheckIcon, LoaderCircleIcon, TerminalIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { cn } from "@/lib/utils";

function Terminal({ className, ...props }: React.ComponentProps<"div">) {
  return <Trace className={cn("w-full", className)} {...props} />;
}

function TerminalCommand({
  command,
  output,
  status = "done",
  defaultOpen = true,
  typewriter = true,
  typeSpeed = 24,
}: {
  command: string;
  output: string;
  status?: "running" | "done" | "error";
  defaultOpen?: boolean;
  typewriter?: boolean;
  typeSpeed?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [visibleChars, setVisibleChars] = useState(
    typewriter ? 0 : command.length
  );

  useEffect(() => {
    if (!typewriter) {
      setVisibleChars(command.length);
      return;
    }
    setVisibleChars(0);
    let c = 0;
    const id = setInterval(() => {
      c++;
      setVisibleChars(c);
      if (c >= command.length) {
        clearInterval(id);
      }
    }, typeSpeed);
    return () => clearInterval(id);
  }, [command, typewriter, typeSpeed]);

  const running = status === "running";
  const failed = status === "error";

  return (
    <TraceCollapsible onOpenChange={setOpen} open={open}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : failed ? "error" : undefined}>
          <TraceIcon>
            {running ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : failed ? (
              <TerminalIcon />
            ) : (
              <CheckIcon />
            )}
          </TraceIcon>
          <TraceTitle>
            <span className="text-muted-foreground">$</span>{" "}
            {command.slice(0, visibleChars)}
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <CodeBlock size="sm">
          <CodeBlockContent className="max-h-64 whitespace-pre-wrap">
            {output || " "}
          </CodeBlockContent>
        </CodeBlock>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export { Terminal, TerminalCommand };
