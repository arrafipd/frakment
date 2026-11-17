import { Alert, AlertDescription, AlertTitle } from "@/components/site/alert";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

const CALLOUT_TYPES = {
  danger: { Icon: CircleAlertIcon, variant: "destructive" as const },
  info: { Icon: InfoIcon, variant: "info" as const },
  neutral: { Icon: InfoIcon, variant: "default" as const },
  success: { Icon: CircleCheckIcon, variant: "success" as const },
  warning: { Icon: TriangleAlertIcon, variant: "warning" as const },
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
      className={cn(
        "mt-6 w-auto md:-mx-1",
        !type && "bg-surface text-surface-foreground border-none",
        className
      )}
      variant={config?.variant ?? "default"}
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
