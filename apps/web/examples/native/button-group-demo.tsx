import { ArrowLeftIcon, MoreHorizontalIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonGroupDemo() {
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-stretch">
        <NativePreviewButton aria-label="Go Back" size="icon" variant="outline">
          <ArrowLeftIcon />
        </NativePreviewButton>
      </div>
      <div className="flex items-stretch">
        <NativePreviewButton className="rounded-r-none" variant="outline">
          Archive
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-l-none border-l-0"
          variant="outline"
        >
          Report
        </NativePreviewButton>
      </div>
      <div className="flex items-stretch">
        <NativePreviewButton className="rounded-r-none" variant="outline">
          Snooze
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="More Options"
          className="rounded-l-none border-l-0"
          size="icon"
          variant="outline"
        >
          <MoreHorizontalIcon />
        </NativePreviewButton>
      </div>
    </div>
  );
}
