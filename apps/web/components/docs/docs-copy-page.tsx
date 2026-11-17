"use client";

import { useCallback } from "react";

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
  V0Icon,
} from "@/components/site/icons";
import {
  Popover,
  PopoverAnchor,
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
import { SITE } from "@/constants/site";
import { ChevronDownIcon } from "@/lib/icons";

const getPromptUrl = (baseURL: string, url: string, param = "q") =>
  `${baseURL}?${param}=${encodeURIComponent(
    `I'm looking at this ${SITE.NAME} documentation: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
`
  )}`;

interface MenuItemData {
  href: (url: string) => string;
  icon: React.ReactNode;
  key: string;
  label: string;
}

const MENU_ITEMS: MenuItemData[] = [
  {
    href: (url) => `${url}.md`,
    icon: <MarkdownDocIcon />,
    key: "markdown",
    label: "View as Markdown",
  },
  {
    href: (url) => getPromptUrl("https://v0.dev", url),
    icon: <V0Icon />,
    key: "v0",
    label: "Open in v0",
  },
  {
    href: (url) => getPromptUrl("https://cursor.com/link/prompt", url, "text"),
    icon: <CursorIcon />,
    key: "cursor",
    label: "Open in Cursor",
  },
  {
    href: (url) => getPromptUrl("https://chatgpt.com", url),
    icon: <ChatGptIcon />,
    key: "chatgpt",
    label: "Open in ChatGPT",
  },
  {
    href: (url) => getPromptUrl("https://claude.ai/new", url),
    icon: <ClaudeIcon />,
    key: "claude",
    label: "Open in Claude",
  },
  {
    href: (url) => getPromptUrl("https://perplexity.ai", url),
    icon: <PerplexityIcon />,
    key: "perplexity",
    label: "Open in Perplexity",
  },
  {
    href: (url) => getPromptUrl("https://gemini.google.com/app", url),
    icon: <GeminiIcon />,
    key: "gemini",
    label: "Open in Gemini",
  },
  {
    href: (url) => getPromptUrl("https://grok.com", url),
    icon: <GrokIcon />,
    key: "grok",
    label: "Open in Grok",
  },
  {
    href: (url) => getPromptUrl("https://scira.ai/", url),
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
  const copyValue = useCallback(async () => {
    const response = await fetch(markdownUrl);
    return response.text();
  }, [markdownUrl]);

  return (
    <Popover>
      <div className="group/buttons bg-secondary relative flex rounded-lg *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10">
        <PopoverAnchor />
        <CopyButton
          className="md:h-7 md:text-[0.8rem]"
          showTooltip={false}
          value={copyValue}
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
            {MENU_ITEMS.map((item) => (
              <DropdownMenuItem
                as="a"
                href={item.href(url)}
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
        <PopoverTrigger asChild className="flex sm:hidden">
          <Button
            className="peer -ml-0.5 size-8 md:size-7 md:text-[0.8rem]"
            size="sm"
            variant="secondary"
          >
            <ChevronDownIcon className="rotate-180 sm:rotate-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="bg-background/70 dark:bg-background/60 w-52 origin-center! rounded-lg p-1 shadow-none backdrop-blur-sm"
        >
          {MENU_ITEMS.map((item) => (
            <SiteButton
              asChild
              className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
              key={item.key}
              size="lg"
              variant="ghost"
            >
              <a
                href={item.href(url)}
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
