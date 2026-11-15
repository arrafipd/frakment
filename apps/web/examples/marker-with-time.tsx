import { ClockIcon } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function MarkerWithTime() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Marker>
        <MarkerIcon>
          <ClockIcon />
        </MarkerIcon>
        <MarkerContent>Profiled in 1.8s</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <ClockIcon />
        </MarkerIcon>
        <MarkerContent>Deployed in 12.4s</MarkerContent>
      </Marker>
    </div>
  );
}
