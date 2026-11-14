"use client";

import {
  CopyIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";

export function MessageActionsDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 py-6">
      <Message>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>
              The install failure is coming from the workspace package.
            </BubbleContent>
          </Bubble>
          <MessageFooter>
            <Button
              aria-label="Copy"
              size="icon-sm"
              title="Copy"
              variant="ghost"
            >
              <CopyIcon />
            </Button>
            <Button
              aria-label="Like"
              size="icon-sm"
              title="Like"
              variant="ghost"
            >
              <ThumbsUpIcon />
            </Button>
            <Button
              aria-label="Dislike"
              size="icon-sm"
              title="Dislike"
              variant="ghost"
            >
              <ThumbsDownIcon />
            </Button>
          </MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Okay drop me a link. Taking a look...</BubbleContent>
          </Bubble>
          <MessageFooter className="gap-2">
            <span className="text-destructive font-normal">Failed to send</span>
            <Button
              aria-label="Retry"
              size="icon-xs"
              title="Retry"
              variant="ghost"
            >
              <RefreshCcwIcon />
            </Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
