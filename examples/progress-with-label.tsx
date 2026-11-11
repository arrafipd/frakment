import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

export function ProgressWithLabel() {
  return (
    <Progress className="w-full max-w-sm" value={56}>
      <ProgressLabel>Upload progress</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}
