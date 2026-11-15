import { Marker, MarkerContent } from "@/components/ui/marker";

export function MarkerShimmer() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Marker>
        <MarkerContent className="shimmer">
          <span className="font-medium">Oliver</span> is typing...
        </MarkerContent>
      </Marker>
      <Marker>
        <MarkerContent className="shimmer">
          Generating response...
        </MarkerContent>
      </Marker>
    </div>
  );
}
