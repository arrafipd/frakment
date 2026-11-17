import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

export function ProgressFileUploadList() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <Progress value={82}>
        <ProgressLabel>design-system.zip</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={34}>
        <ProgressLabel>annual-report.pdf</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  );
}
