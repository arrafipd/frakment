import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "@/lib/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const CALLOUT_TYPES = {
  info: { variant: "info" as const, Icon: InfoIcon },
  success: { variant: "success" as const, Icon: CircleCheckIcon },
  warning: { variant: "warning" as const, Icon: TriangleAlertIcon },
  danger: { variant: "destructive" as const, Icon: CircleAlertIcon },
  neutral: { variant: "default" as const, Icon: InfoIcon },
};

export type CalloutType = keyof typeof CALLOUT_TYPES;

export const Callout = ({
  type,
  title,
  children,
  icon,
  className,
  ...props
}: React.ComponentProps<typeof Alert> & {
  type?: CalloutType;
  icon?: React.ReactNode;
}) => {
  const config = type ? CALLOUT_TYPES[type] : null;
  const Icon = config?.Icon;
  const renderedIcon = icon ?? (Icon ? <Icon /> : null);

  return (
    <Alert
      variant={config?.variant ?? "default"}
      className={cn(
        "mt-6 w-auto md:-mx-1",
        !type && "bg-surface text-surface-foreground border-none",
        className
      )}
      {...props}
    >
      {renderedIcon}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className={cn(!type && "text-card-foreground/80")}>
        {children}
      </AlertDescription>
    </Alert>
  );
};
