import { ArrowUpIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NativePreviewButton variant="outline">Button</NativePreviewButton>
      <NativePreviewButton aria-label="Submit" size="icon" variant="outline">
        <ArrowUpIcon />
      </NativePreviewButton>
    </div>
  );
}
