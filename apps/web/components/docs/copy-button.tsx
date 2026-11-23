"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { Event } from "@/lib/events";
import { trackEvent } from "@/lib/events";
import { CheckIcon, CopyIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface CopyButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "value"> {
  event?: Event["name"];
  showTooltip?: boolean;
  src?: string;
  value: string | (() => Promise<string> | string);
}

export const CopyButton = ({
  value,
  className,
  variant = "ghost",
  event,
  children,
  showTooltip = true,
  ...props
}: CopyButtonProps) => {
  const getValue = useCallback(() => {
    if (typeof value === "function") {
      return value();
    }

    return value;
  }, [value]);

  const { copyToClipboard, isCopied } = useCopyToClipboard({
    timeout: 1000,
  });

  const handleCopy = useCallback(async () => {
    try {
      const result = getValue();
      const text = typeof result === "string" ? result : await result;
      const hasCopied = await copyToClipboard(text);

      if (!hasCopied) {
        toast.error(
          "Could not copy to clipboard. Check browser permissions and try again."
        );
        return;
      }

      if (event) {
        trackEvent({
          name: event,
          properties: {
            code: text,
          },
        });
      }
    } catch (error) {
      console.error("Failed to prepare content for copying.", error);
      toast.error("Could not prepare content for copying. Please try again.");
    }
  }, [copyToClipboard, event, getValue]);

  const copyButton = (
    <Button
      className={cn(
        children
          ? ""
          : "bg-code absolute top-3 right-2 z-10 size-7 hover:opacity-100 focus-visible:opacity-100",
        className
      )}
      data-slot="copy-button"
      onClick={handleCopy}
      size={children ? "sm" : "icon"}
      variant={variant}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {isCopied ? (
        <span className="frakment-icon-enter inline-flex" key="done">
          <CheckIcon weight="bold" />
        </span>
      ) : (
        <span className="frakment-icon-enter inline-flex" key="idle">
          <CopyIcon />
        </span>
      )}
      {children}
    </Button>
  );

  if (!showTooltip) {
    return copyButton;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{copyButton}</TooltipTrigger>
      <TooltipContent>
        {isCopied ? "Copied" : "Copy to Clipboard"}
      </TooltipContent>
    </Tooltip>
  );
};
