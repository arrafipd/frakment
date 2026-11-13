import { ArrowUpIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonRounded() {
  return (
    <div className="flex gap-2">
      <NativePreviewButton className="rounded-full">
        Get Started
      </NativePreviewButton>
      <NativePreviewButton
        className="rounded-full"
        size="icon"
        variant="outline"
      >
        <ArrowUpIcon />
      </NativePreviewButton>
    </div>
  );
}
