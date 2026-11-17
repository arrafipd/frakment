import { CheckIcon, GitBranchIcon, SearchIcon } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function MarkerWithIcon() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Marker className="mx-auto w-fit">
        <MarkerIcon>
          <GitBranchIcon />
        </MarkerIcon>
        <MarkerContent>Switched to a new branch</MarkerContent>
      </Marker>
      <Marker className="mx-auto w-fit">
        <MarkerIcon>
          <SearchIcon />
        </MarkerIcon>
        <MarkerContent>Explored 4 files</MarkerContent>
      </Marker>
      <Marker className="mx-auto w-fit">
        <MarkerIcon>
          <CheckIcon />
        </MarkerIcon>
        <MarkerContent>All checks passed</MarkerContent>
      </Marker>
    </div>
  );
}
