import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";

export function MarkerInContext() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Thinking…</MarkerContent>
      </Marker>
      <Marker role="status" variant="separator">
        <MarkerContent>Read 4 files</MarkerContent>
      </Marker>
    </div>
  );
}
