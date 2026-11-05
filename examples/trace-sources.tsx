import { ArrowUpRightIcon, Globe } from "lucide-react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

const SOURCES = [
  {
    href: "https://docs.astro.build/en/install-and-setup/",
    title: "Install Astro | docs.astro.build",
  },
  {
    href: "https://www.npmjs.com/package/create-astro",
    title: "create-astro | npmjs.com",
  },
  {
    href: "https://pnpm.io/settings#minimumreleaseage",
    title: "Settings: minimumReleaseAge | pnpm.io",
  },
];

export function TraceSources() {
  return (
    <div className="max-w-sm">
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Globe />
            </TraceIcon>
            <TraceTitle>Used {SOURCES.length} sources</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {SOURCES.map((s) => (
              <a href={s.href} key={s.href} rel="noreferrer" target="_blank">
                <TraceLine>
                  <TraceIcon>
                    <Globe />
                  </TraceIcon>
                  <TraceTitle>
                    {s.title}
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
    </div>
  );
}
