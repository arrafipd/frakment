import { ArrowUpRightIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonSize() {
  return (
    <div className="flex flex-col items-start gap-8 sm:flex-row">
      <div className="flex items-start gap-2">
        <NativePreviewButton size="xs" variant="outline">
          Extra Small
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="Submit"
          size="icon-xs"
          variant="outline"
        >
          <ArrowUpRightIcon />
        </NativePreviewButton>
      </div>
      <div className="flex items-start gap-2">
        <NativePreviewButton size="sm" variant="outline">
          Small
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="Submit"
          size="icon-sm"
          variant="outline"
        >
          <ArrowUpRightIcon />
        </NativePreviewButton>
      </div>
      <div className="flex items-start gap-2">
        <NativePreviewButton variant="outline">Default</NativePreviewButton>
        <NativePreviewButton aria-label="Submit" size="icon" variant="outline">
          <ArrowUpRightIcon />
        </NativePreviewButton>
      </div>
      <div className="flex items-start gap-2">
        <NativePreviewButton size="lg" variant="outline">
          Large
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="Submit"
          size="icon-lg"
          variant="outline"
        >
          <ArrowUpRightIcon />
        </NativePreviewButton>
      </div>
    </div>
  );
}
