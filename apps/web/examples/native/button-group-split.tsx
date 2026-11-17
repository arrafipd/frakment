import { PlusIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonGroupSplit() {
  return (
    <div className="flex items-stretch">
      <NativePreviewButton className="rounded-r-none" variant="secondary">
        Button
      </NativePreviewButton>
      <div className="my-px w-px self-stretch" />
      <NativePreviewButton
        aria-label="Add"
        className="rounded-l-none border-l-0"
        size="icon"
        variant="secondary"
      >
        <PlusIcon />
      </NativePreviewButton>
    </div>
  );
}
