import { NativePreviewButton } from "@/components/docs/native-preview-button";

export function NativeButtonGroupSeparator() {
  return (
    <div className="flex items-stretch">
      <NativePreviewButton
        className="rounded-r-none"
        size="sm"
        variant="secondary"
      >
        Copy
      </NativePreviewButton>
      <div className="bg-border my-px w-px self-stretch" />
      <NativePreviewButton
        className="rounded-l-none border-l-0"
        size="sm"
        variant="secondary"
      >
        Paste
      </NativePreviewButton>
    </div>
  );
}
