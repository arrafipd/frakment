import { Spinner } from "@/components/ui/spinner";

export function SpinnerShapes() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-6" />
        <span className="text-muted-foreground text-xs">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-6" variant="spoke" />
        <span className="text-muted-foreground text-xs">spoke</span>
      </div>
    </div>
  );
}
