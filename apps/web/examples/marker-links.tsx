import { ChevronRightIcon, GitBranchIcon, SearchIcon } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function MarkerLinks() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Marker as="a" href="#">
        <MarkerIcon>
          <GitBranchIcon />
        </MarkerIcon>
        <MarkerContent>View branch on GitHub</MarkerContent>
        <ChevronRightIcon className="ms-auto size-4 opacity-50" />
      </Marker>
      <Marker as="button" type="button">
        <MarkerIcon>
          <SearchIcon />
        </MarkerIcon>
        <MarkerContent>Show all 4 explored files</MarkerContent>
        <ChevronRightIcon className="ms-auto size-4 opacity-50" />
      </Marker>
    </div>
  );
}
