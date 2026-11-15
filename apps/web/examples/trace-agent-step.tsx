"use client";

import { CircleCheckIcon, LoaderCircleIcon } from "lucide-react";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";

export function TraceAgentStep() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Trace>
        <TraceLine>
          <TraceIcon>
            <CircleCheckIcon />
          </TraceIcon>
          <TraceTitle>Read 4 files</TraceTitle>
        </TraceLine>
        <TraceLine>
          <TraceIcon>
            <CircleCheckIcon />
          </TraceIcon>
          <TraceTitle>Ran pnpm test</TraceTitle>
        </TraceLine>
        <TraceLine status="running">
          <TraceIcon>
            <LoaderCircleIcon className="animate-spin" />
          </TraceIcon>
          <TraceTitle>Writing patch</TraceTitle>
        </TraceLine>
      </Trace>
    </div>
  );
}
