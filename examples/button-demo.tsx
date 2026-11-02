import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  LoaderCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@/lib/icons";

export function ButtonDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="rounded-lg border border-border p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Delete project</span>
          <span className="text-sm text-muted-foreground">
            This action cannot be undone.
          </span>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button variant="destructive" size="sm">
            <TrashIcon />
            Delete
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>
          <PlusIcon />
          New project
        </Button>
        <Button variant="outline">
          View docs
          <ArrowRightIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled>
          <LoaderCircleIcon className="animate-spin" />
          Processing
        </Button>
        <Button variant="secondary">Save changes</Button>
      </div>
    </div>
  );
}
