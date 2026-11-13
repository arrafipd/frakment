import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonGroupText() {
  return (
    <div className="flex items-stretch">
      <div className="bg-secondary border-border flex items-center rounded-l-[10px] border px-2.5 text-sm font-medium">
        Label
      </div>
      <NativePreviewButton className="-ml-px rounded-l-none" variant="outline">
        Action
      </NativePreviewButton>
    </div>
  );
}
