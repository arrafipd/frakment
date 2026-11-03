import { PulseStatus } from "@/components/ui/pulse-status";

export function PulseStatusDemo() {
  return (
    <div className="border-border flex w-full max-w-sm flex-col gap-3 rounded-lg border p-4">
      <PulseStatus status="up" />
      <PulseStatus status="degraded" />
      <PulseStatus status="down" />
      <div className="border-border my-2 border-t" />
      <PulseStatus count={2} status="degraded" />
      <PulseStatus count={1} status="down" />
      <PulseStatus label="All 12 services healthy" status="up" />
    </div>
  );
}
