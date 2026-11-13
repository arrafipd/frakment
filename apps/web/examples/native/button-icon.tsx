import { CircleArrowUpIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonIcon() {
  return (
    <NativePreviewButton size="icon" variant="outline">
      <CircleArrowUpIcon />
    </NativePreviewButton>
  );
}
