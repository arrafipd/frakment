import { GitBranchIcon } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function MarkerBorder() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Marker variant="border">
        <MarkerIcon>
          <GitBranchIcon />
        </MarkerIcon>
        <MarkerContent>Switched to release-candidate</MarkerContent>
      </Marker>
      <Marker>
        <MarkerContent>build started</MarkerContent>
      </Marker>
    </div>
  );
}
