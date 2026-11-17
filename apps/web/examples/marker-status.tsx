import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";

export function MarkerStatus() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Marker className="mx-auto w-fit" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent className="shimmer">Thinking...</MarkerContent>
      </Marker>
      <Marker className="mx-auto w-fit" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent className="shimmer">Reading 4 files...</MarkerContent>
      </Marker>
      <Marker className="mx-auto w-fit" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent className="shimmer">Running tests...</MarkerContent>
      </Marker>
    </div>
  );
}
