"use client";

import { useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

import type { ShareIconHandle } from "@/components/animated-icons/share";
import { ShareIcon } from "@/components/animated-icons/share";
import { LinkedInIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { EllipsisIcon, LinkIcon } from "@/lib/icons";

export const DocsShareMenu = ({
  title,
  url,
}: {
  title: string;
  url: string;
}) => {
  const shareIconRef = useRef<ShareIconHandle>(null);
  const { copyToClipboard } = useCopyToClipboard();

  const absoluteUrl = useMemo(() => {
    if (url.startsWith("http")) {
      return url;
    }
    if (typeof window !== "undefined") {
      return new URL(url, window.location.origin).toString();
    }
    return url;
  }, [url]);

  const handleMouseEnter = useCallback(() => {
    shareIconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    shareIconRef.current?.stopAnimation();
  }, []);

  const urlEncoded = encodeURIComponent(absoluteUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="hidden size-7 border-none active:scale-none sm:flex"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          size="icon-sm"
          variant="secondary"
        >
          <ShareIcon ref={shareIconRef} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        alignOffset={-6}
        className="w-fit"
        collisionPadding={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          onClick={() => {
            copyToClipboard(absoluteUrl);
            toast.success("Link copied");
          }}
        >
          <LinkIcon />
          Copy link
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`https://x.com/intent/tweet?url=${urlEncoded}`}
            rel="noopener"
            target="_blank"
          >
            <XIcon />
            Share on X
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite?url=${urlEncoded}`}
            rel="noopener"
            target="_blank"
          >
            <LinkedInIcon />
            Share on LinkedIn
          </a>
        </DropdownMenuItem>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              navigator.share({ title, url: absoluteUrl });
            }}
          >
            <EllipsisIcon />
            Other app
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
