import { MinusIcon, PlusIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonGroupOrientation() {
  return (
    <div className="flex flex-col">
      <NativePreviewButton
        className="rounded-b-none"
        size="icon"
        variant="outline"
      >
        <PlusIcon />
      </NativePreviewButton>
      <NativePreviewButton
        className="rounded-t-none border-t-0"
        size="icon"
        variant="outline"
      >
        <MinusIcon />
      </NativePreviewButton>
    </div>
  );
}
