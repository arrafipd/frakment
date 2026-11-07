"use client";

import {
  CheckIcon,
  CopyIcon,
  PencilIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import * as React from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const reply = `Install Dialog, then open it from the gear button in \`site-header.tsx\`.

\`\`\`bash
npx shadcn@latest add dialog
\`\`\`

Wrap the button in a \`DialogTrigger\` and put the settings form in \`DialogContent\`. Focus moves into the dialog when it opens, and **Esc** closes it.`;

export function MessageDemo() {
  const [copied, setCopied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<"like" | "dislike" | null>(
    null
  );

  React.useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 py-6 text-sm">
      <Message align="end">
        <MessageContent className="gap-2">
          <Bubble align="end" variant="muted">
            <BubbleContent>
              How do I add a settings dialog? It should open from the gear icon
              in the header.
            </BubbleContent>
          </Bubble>
          <MessageFooter>
            <MessageAction label="Copy">
              <CopyIcon />
            </MessageAction>
            <MessageAction label="Edit">
              <PencilIcon />
            </MessageAction>
          </MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent className="gap-2">
          <Markdown>{reply}</Markdown>
          <MessageFooter className="px-0">
            <MessageAction
              label={copied ? "Copied" : "Copy"}
              onClick={() => {
                navigator.clipboard.writeText(reply);
                setCopied(true);
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </MessageAction>
            <MessageAction
              aria-pressed={feedback === "like"}
              label="Good response"
              onClick={() => setFeedback(feedback === "like" ? null : "like")}
            >
              <ThumbsUpIcon
                className={feedback === "like" ? "fill-current" : undefined}
              />
            </MessageAction>
            <MessageAction
              aria-pressed={feedback === "dislike"}
              label="Bad response"
              onClick={() =>
                setFeedback(feedback === "dislike" ? null : "dislike")
              }
            >
              <ThumbsDownIcon
                className={feedback === "dislike" ? "fill-current" : undefined}
              />
            </MessageAction>
            <MessageAction label="Retry">
              <RefreshCcwIcon />
            </MessageAction>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}

function MessageAction({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button aria-label={label} size="icon-sm" variant="ghost" {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
