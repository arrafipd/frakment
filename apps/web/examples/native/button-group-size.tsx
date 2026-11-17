import { PlusIcon } from "lucide-react";

import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonGroupSize() {
  return (
    <div className="flex flex-col items-start gap-8">
      <div className="flex items-stretch">
        <NativePreviewButton
          className="rounded-r-none"
          size="sm"
          variant="outline"
        >
          Small
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-none border-l-0"
          size="sm"
          variant="outline"
        >
          Button
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-none border-l-0"
          size="sm"
          variant="outline"
        >
          Group
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="Add"
          className="rounded-l-none border-l-0"
          size="icon-sm"
          variant="outline"
        >
          <PlusIcon />
        </NativePreviewButton>
      </div>
      <div className="flex items-stretch">
        <NativePreviewButton className="rounded-r-none" variant="outline">
          Default
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-none border-l-0"
          variant="outline"
        >
          Button
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-none border-l-0"
          variant="outline"
        >
          Group
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="Add"
          className="rounded-l-none border-l-0"
          size="icon"
          variant="outline"
        >
          <PlusIcon />
        </NativePreviewButton>
      </div>
      <div className="flex items-stretch">
        <NativePreviewButton
          className="rounded-r-none"
          size="lg"
          variant="outline"
        >
          Large
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-none border-l-0"
          size="lg"
          variant="outline"
        >
          Button
        </NativePreviewButton>
        <NativePreviewButton
          className="rounded-none border-l-0"
          size="lg"
          variant="outline"
        >
          Group
        </NativePreviewButton>
        <NativePreviewButton
          aria-label="Add"
          className="rounded-l-none border-l-0"
          size="icon-lg"
          variant="outline"
        >
          <PlusIcon />
        </NativePreviewButton>
      </div>
    </div>
  );
}
