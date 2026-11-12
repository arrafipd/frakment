"use client";

import { useCallback } from "react";

import { CopyButton } from "@/components/copy-button";
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
} from "@/components/icons";
import { SiteButton } from "@/components/site/button";
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

const MENU_ITEMS: [string, (url: string) => React.ReactNode][] = [
  [
    "markdown",
    (url) => (
      <a href={`${url}.md`} rel="noopener noreferrer" target="_blank">
        <MarkdownDocIcon />
        View as Markdown
      </a>
    ),
  ],
  [
    "v0",
    (url) => (
      <a
        href={getPromptUrl("https://v0.dev", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <V0Icon />
        <span className="translate-x-[-2px]">Open in v0</span>
      </a>
    ),
  ],
  [
    "cursor",
    (url) => (
      <a
        href={getPromptUrl("https://cursor.com/link/prompt", url, "text")}
        rel="noopener noreferrer"
        target="_blank"
      >
        <CursorIcon />
        Open in Cursor
      </a>
    ),
  ],
  [
    "chatgpt",
    (url) => (
      <a
        href={getPromptUrl("https://chatgpt.com", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ChatGptIcon />
        Open in ChatGPT
      </a>
    ),
  ],
  [
    "claude",
    (url) => (
      <a
        href={getPromptUrl("https://claude.ai/new", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ClaudeIcon />
        Open in Claude
      </a>
    ),
  ],
  [
    "perplexity",
    (url) => (
      <a
        href={getPromptUrl("https://perplexity.ai", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <PerplexityIcon />
        Open in Perplexity
      </a>
    ),
  ],
  [
    "gemini",
    (url) => (
      <a
        href={getPromptUrl("https://gemini.google.com/app", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GeminiIcon />
        Open in Gemini
      </a>
    ),
  ],
  [
    "grok",
    (url) => (
      <a
        href={getPromptUrl("https://grok.com", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GrokIcon />
        Open in Grok
      </a>
    ),
  ],
  [
    "scira",
    (url) => (
      <a
        className="m-0 p-0"
        href={getPromptUrl("https://scira.ai/", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SciraIcon />
        Open in Scira AI
      </a>
    ),
  ],
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

  const trigger = (
    <Button
      className="peer -ml-0.5 size-8 md:size-7 md:text-[0.8rem]"
      size="sm"
      variant="secondary"
    >
      <ChevronDownIcon className="rotate-180 sm:rotate-0" />
    </Button>
  );

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
          <DropdownMenuTrigger asChild className="hidden sm:flex">
            {trigger}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="animate-none! rounded-lg shadow-none"
          >
            {MENU_ITEMS.map(([key, render]) => (
              <DropdownMenuItem asChild key={key}>
                {render(url)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator
          className="bg-foreground/5! absolute top-1 right-8 z-0 h-6! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!"
          orientation="vertical"
        />
        <PopoverTrigger asChild className="flex sm:hidden">
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="bg-background/70 dark:bg-background/60 w-52 origin-center! rounded-lg p-1 shadow-none backdrop-blur-sm"
        >
          {MENU_ITEMS.map(([key, render]) => (
            <SiteButton
              asChild
              className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
              key={key}
              size="lg"
              variant="ghost"
            >
              {render(url)}
            </SiteButton>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  );
};
