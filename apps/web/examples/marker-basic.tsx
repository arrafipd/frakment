import { Marker, MarkerContent } from "@/components/ui/marker";

export function MarkerBasic() {
  return (
    <div className="w-full max-w-sm">
      <Marker className="mx-auto w-fit">
        <MarkerContent>Conversation started</MarkerContent>
      </Marker>
    </div>
  );
}
