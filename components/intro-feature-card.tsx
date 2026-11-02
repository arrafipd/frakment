import type { LucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IntroFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const IntroFeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: IntroFeatureCardProps) => (
  <div
    className={cn(
      "flex flex-col overflow-hidden rounded border border-border bg-background transition-colors hover:border-foreground/40",
      className
    )}
  >
    <div className="flex h-24 items-center justify-center border-b border-border bg-muted/30 sm:h-32">
      <Icon className="size-5 text-foreground sm:size-6" />
    </div>
    <div className="flex flex-col gap-1 px-3 py-3 sm:px-4 sm:py-3.5">
      <span className="text-xs font-semibold text-foreground sm:text-sm">
        {title}
      </span>
      <p className="text-[11px] leading-snug text-foreground/70 sm:text-[13px]">
        {description}
      </p>
    </div>
  </div>
);
