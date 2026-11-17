import { GitBranchIcon } from "lucide-react";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";

export function TraceStatic() {
  return (
    <Trace className="mx-auto w-fit max-w-full">
      <TraceLine>
        <TraceIcon>
          <GitBranchIcon />
        </TraceIcon>
        <TraceTitle>Created branch fix/frozen-lockfile</TraceTitle>
      </TraceLine>
    </Trace>
  );
}
