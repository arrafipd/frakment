import { Spinner } from "@/components/ui/spinner";

export function SpinnerInContext() {
  return (
    <div className="w-full max-w-sm py-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Spinner />
        <span className="shimmer">Thinking…</span>
      </div>
    </div>
  );
}
