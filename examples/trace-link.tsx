import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  FileTextIcon,
  Globe,
} from "lucide-react";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";

export function TraceLink() {
  return (
    <Trace className="max-w-sm">
      <a href="#link">
        <TraceLine>
          <TraceIcon>
            <FileTextIcon />
          </TraceIcon>
          <TraceTitle>Read apps/v4/lib/docs.ts</TraceTitle>
          <TraceIcon>
            <ChevronRightIcon />
          </TraceIcon>
        </TraceLine>
      </a>
      <a
        href="https://docs.astro.build/en/install-and-setup/"
        rel="noreferrer"
        target="_blank"
      >
        <TraceLine>
          <TraceIcon>
            <Globe />
          </TraceIcon>
          <TraceTitle>
            Install Astro | docs.astro.build
            <span className="sr-only"> (opens in a new tab)</span>
          </TraceTitle>
          <TraceIcon>
            <ArrowUpRightIcon />
          </TraceIcon>
        </TraceLine>
      </a>
    </Trace>
  );
}
