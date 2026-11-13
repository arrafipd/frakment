import { GitBranch, GitFork } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonWithIcon() {
  return (
    <div className="flex gap-2">
      <NativePreviewButton variant="outline">
        <GitBranch /> New Branch
      </NativePreviewButton>
      <NativePreviewButton variant="outline">
        Fork
        <GitFork />
      </NativePreviewButton>
    </div>
  );
}
