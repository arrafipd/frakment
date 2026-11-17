import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ButtonLoading() {
  return (
    <div className="flex gap-2">
      <Button disabled variant="outline">
        <Spinner data-icon="inline-start" />
        Generating
      </Button>
      <Button disabled variant="outline">
        <Spinner data-icon="inline-start" />
        Downloading
      </Button>
    </div>
  );
}
