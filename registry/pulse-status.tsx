import { CircleCheck, TriangleAlert, X } from "@/lib/icons";

import { cn } from "@/lib/utils";

export type PulseStatusType = "up" | "degraded" | "down";

const STATUS_CONFIG = {
  up: {
    icon: CircleCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    label: "All systems operational",
  },
  degraded: {
    icon: TriangleAlert,
    color: "text-amber-600 dark:text-amber-400",
    label: "Degraded",
  },
  down: {
    icon: X,
    color: "text-rose-600 dark:text-rose-400",
    label: "Outage",
  },
} as const;

interface PulseStatusProps extends React.ComponentProps<"p"> {
  status: PulseStatusType;
  label?: string;
  count?: number;
}

function PulseStatus({
  status,
  label,
  count,
  className,
  ...props
}: PulseStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const text =
    label ??
    (count !== undefined
      ? count === 1
        ? "1 service affected"
        : `${count} services affected`
      : config.label);

  return (
    <p
      data-slot="pulse-status"
      data-status={status}
      className={cn(
        "flex items-center gap-1.5 text-sm",
        config.color,
        className
      )}
      {...props}
    >
      <Icon aria-hidden className="size-4" />
      {text}
    </p>
  );
}

export { PulseStatus };