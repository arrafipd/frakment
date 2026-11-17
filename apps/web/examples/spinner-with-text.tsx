import { Spinner } from "@/components/ui/spinner";

export function SpinnerWithText() {
  return (
    <div className="flex items-center gap-2">
      <Spinner />
      <span>Loading…</span>
    </div>
  );
}
