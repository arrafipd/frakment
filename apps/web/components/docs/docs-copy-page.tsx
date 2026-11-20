"use client";

import { useEffect, useState } from "react";

import { CopyButton } from "@/components/docs/copy-button";
import { SiteButton } from "@/components/site/button";
import {
  ChatGptIcon,
  ClaudeIcon,
  CursorIcon,
  GeminiIcon,
  GrokIcon,
  MarkdownDocIcon,
  PerplexityIcon,
  SciraIcon,
} from "@/components/site/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/site/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { fallbackSiteOrigin, SITE } from "@/config/site";
import { ChevronDownIcon } from "@/lib/icons";

const getShareableUrl = (href: string) => {
  const url = new URL(href, SITE.URL);
  if (
    !(
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.hostname.endsWith(".localhost")
    )
  ) {
    return url.toString();
  }

  const publicUrl = new URL(fallbackSiteOrigin);
  publicUrl.pathname = `${publicUrl.pathname.replace(/\/+$/u, "")}${url.pathname}`;
  publicUrl.search = url.search;
  publicUrl.hash = url.hash;
  return publicUrl.toString();
};

const getPrompt = (url: string, markdownUrl: string) =>
  `Read this ${SITE.NAME} documentation page before answering.
Page: ${url}
Markdown: ${markdownUrl}
Explain how to use it and help with examples or debugging based on its content.`;

const getPromptUrl =
  (baseUrl: string, param = "q") =>
  (url: string, markdownUrl: string) => {
    const destination = new URL(baseUrl);
    destination.searchParams.set(
      param,
      getPrompt(getShareableUrl(url), getShareableUrl(markdownUrl))
    );
    return destination.toString();
  };

interface MenuItemData {
  href: (url: string, markdownUrl: string) => string;
  icon: React.ReactNode;
  key: string;
  label: string;
}

const menuItems: MenuItemData[] = [
  {
    href: (_url, markdownUrl) => markdownUrl,
    icon: <MarkdownDocIcon />,
    key: "markdown",
    label: "View as Markdown",
  },
  {
    href: getPromptUrl("https://cursor.com/link/prompt", "text"),
    icon: <CursorIcon />,
    key: "cursor",
    label: "Open in Cursor",
  },
  {
    href: getPromptUrl("https://chatgpt.com/", "q"),
    icon: <ChatGptIcon />,
    key: "chatgpt",
    label: "Open in ChatGPT",
  },
  {
    href: getPromptUrl("https://claude.ai/new", "q"),
    icon: <ClaudeIcon />,
    key: "claude",
    label: "Open in Claude",
  },
  {
    href: getPromptUrl("https://www.perplexity.ai/search/new", "q"),
    icon: <PerplexityIcon />,
    key: "perplexity",
    label: "Open in Perplexity",
  },
  {
    href: getPromptUrl("https://gemini.google.com/app", "prompt"),
    icon: <GeminiIcon />,
    key: "gemini",
    label: "Open in Gemini",
  },
  {
    href: getPromptUrl("https://grok.com/", "q"),
    icon: <GrokIcon />,
    key: "grok",
    label: "Open in Grok",
  },
  {
    href: getPromptUrl("https://scira.ai/", "q"),
    icon: <SciraIcon />,
    key: "scira",
    label: "Open in Scira AI",
  },
];

export const DocsCopyPage = ({
  markdownUrl,
  url,
}: {
  markdownUrl: string;
  url: string;
}) => {
  const [markdown, setMarkdown] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();

    fetch(markdownUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Markdown request failed with status ${response.status}`
          );
        }
        return response.text();
      })
      .then(setMarkdown)
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load page markdown for copying.", error);
        toast.error("Could not load the page content. Refresh and try again.");
      });

    return () => controller.abort();
  }, [markdownUrl]);

  return (
    <Popover>
      <div className="group/buttons bg-secondary relative flex rounded-lg *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10">
        <CopyButton
          className="md:h-7 md:text-[0.8rem]"
          disabled={markdown === undefined}
          showTooltip={false}
          value={markdown ?? ""}
          variant="secondary"
        >
          Copy Page
        </CopyButton>
        <DropdownMenu>
          <DropdownMenuTrigger
            as={Button}
            className="peer -ml-0.5 hidden size-8 sm:flex md:size-7 md:text-[0.8rem]"
            size="sm"
            variant="secondary"
          >
            <ChevronDownIcon className="rotate-180 sm:rotate-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="animate-none! rounded-lg shadow-none"
          >
            {menuItems.map((item) => (
              <DropdownMenuItem
                as="a"
                href={item.href(url, markdownUrl)}
                key={item.key}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator
          className="bg-foreground/5! absolute top-1 right-8 z-0 h-6! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!"
          orientation="vertical"
        />
        <PopoverTrigger
          as={Button}
          className="peer -ml-0.5 flex size-8 sm:hidden md:size-7 md:text-[0.8rem]"
          size="sm"
          variant="secondary"
        >
          <ChevronDownIcon className="rotate-180 sm:rotate-0" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="bg-background/70 dark:bg-background/60 w-52 origin-center! rounded-lg p-1 shadow-none backdrop-blur-sm"
        >
          {menuItems.map((item) => (
            <SiteButton
              asChild
              className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
              key={item.key}
              size="lg"
              variant="ghost"
            >
              <a
                href={item.href(url, markdownUrl)}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.icon}
                {item.label}
              </a>
            </SiteButton>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  );
};
