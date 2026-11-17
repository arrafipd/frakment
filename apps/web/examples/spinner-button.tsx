import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function SpinnerButton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>
        <Spinner data-icon="inline-start" />
        Processing
      </Button>
      <Button disabled variant="outline">
        <Spinner data-icon="inline-start" />
        Saving
      </Button>
      <Button disabled variant="secondary">
        Loading
        <Spinner data-icon="inline-end" />
      </Button>
    </div>
  );
}
