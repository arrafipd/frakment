import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { FileTextIcon, SearchIcon, TerminalIcon } from "@/lib/icons";

export function TraceGroup() {
  return (
    <Trace className="max-w-sm">
      <TraceLine>
        <TraceIcon>
          <SearchIcon />
        </TraceIcon>
        <TraceTitle>Searched for minimumReleaseAge</TraceTitle>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <FileTextIcon />
        </TraceIcon>
        <TraceTitle>Read pnpm-workspace.yaml</TraceTitle>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <TerminalIcon />
        </TraceIcon>
        <TraceTitle>Ran pnpm install</TraceTitle>
      </TraceLine>
    </Trace>
  );
}
