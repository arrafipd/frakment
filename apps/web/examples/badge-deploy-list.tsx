import { CheckIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export function BadgeDeployList() {
  return (
    <div className="w-full max-w-md space-y-3">
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm font-medium">Deploy v1.2.0</span>
        <Badge>
          <CheckIcon />
          Success
        </Badge>
      </div>
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm font-medium">Deploy v1.2.1</span>
        <Badge variant="secondary">
          <Spinner borderWidth={1} />
          Building
        </Badge>
      </div>
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm font-medium">Deploy v1.2.2</span>
        <Badge variant="destructive">
          <XIcon />
          Failed
        </Badge>
      </div>
    </div>
  );
}
