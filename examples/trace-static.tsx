import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { GitBranchIcon } from "@/lib/icons";

export function TraceStatic() {
  return (
    <Trace className="max-w-sm">
      <TraceLine>
        <TraceIcon>
          <GitBranchIcon />
        </TraceIcon>
        <TraceTitle>Created branch fix/frozen-lockfile</TraceTitle>
      </TraceLine>
    </Trace>
  );
}
