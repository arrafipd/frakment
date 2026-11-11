import { ArrowUpRightIcon, GlobeIcon } from "lucide-react";

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

const sources = [
  {
    title: "Install Astro | docs.astro.build",
    url: "https://docs.astro.build/en/install-and-setup/",
  },
  {
    title: "create-astro | npmjs.com",
    url: "https://www.npmjs.com/package/create-astro",
  },
  {
    title: "pnpm create | pnpm.io",
    url: "https://pnpm.io/cli/create",
  },
];

export function SourcesStatic() {
  return (
    <Trace className="max-w-sm">
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <GlobeIcon />
            </TraceIcon>
            <TraceTitle>{`Used ${sources.length} sources`}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {sources.map((source) => (
              <a
                className="decoration-muted-foreground block rounded-md underline-offset-4 hover:underline"
                href={source.url}
                key={source.url}
                rel="noreferrer"
                target="_blank"
              >
                <TraceLine>
                  <TraceTitle>
                    {source.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TraceTitle>
                  <TraceIcon>
                    <ArrowUpRightIcon />
                  </TraceIcon>
                </TraceLine>
              </a>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
