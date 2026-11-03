import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { CheckIcon, ClockIcon, LoaderCircleIcon } from "@/lib/icons";

export function TraceDemo() {
  return (
    <div className="w-full max-w-md">
      <Trace>
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>
            <TraceLine status="running">
              <TraceIcon>
                <LoaderCircleIcon className="animate-spin" />
              </TraceIcon>
              <TraceTitle>{"Profiling dashboard route"}</TraceTitle>
              <TraceDescription>{"1.8s"}</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Trace>
              <TraceLine>
                <TraceIcon>
                  <CheckIcon />
                </TraceIcon>
                <TraceTitle>{"Analyzed bundle for dashboard"}</TraceTitle>
                <TraceDescription>{"1240 KB"}</TraceDescription>
              </TraceLine>
              <TraceLine>
                <TraceIcon>
                  <CheckIcon />
                </TraceIcon>
                <TraceTitle>
                  {"Profiled 3 network requests on /dashboard"}
                </TraceTitle>
                <TraceDescription>{"620ms"}</TraceDescription>
              </TraceLine>
              <TraceLine status="running">
                <TraceIcon>
                  <LoaderCircleIcon className="animate-spin" />
                </TraceIcon>
                <TraceTitle>{"Scanning render tree for Dashboard"}</TraceTitle>
              </TraceLine>
              <TraceLine status="pending">
                <TraceIcon>
                  <ClockIcon />
                </TraceIcon>
                <TraceTitle>{"Waiting for trace to complete"}</TraceTitle>
              </TraceLine>
            </Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    </div>
  );
}
