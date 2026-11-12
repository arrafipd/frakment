import { GitBranch, GitFork } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ButtonWithIcon() {
  return (
    <div className="flex gap-2">
      <Button variant="outline">
        <GitBranch data-icon="inline-start" /> New Branch
      </Button>
      <Button variant="outline">
        Fork
        <GitFork data-icon="inline-end" />
      </Button>
    </div>
  );
}
