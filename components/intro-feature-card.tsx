import type { IconComponent } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IntroFeatureCardProps {
  className?: string;
  description: string;
  icon: IconComponent;
  title: string;
}

export const IntroFeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: IntroFeatureCardProps) => (
  <div
    className={cn(
      "border-border bg-background hover:border-foreground/40 flex flex-col overflow-hidden rounded border transition-colors",
      className
    )}
  >
    <div className="border-border bg-muted/30 flex h-24 items-center justify-center border-b sm:h-32">
      <Icon className="text-foreground size-5 sm:size-6" />
    </div>
    <div className="flex flex-col gap-1 px-3 py-3 sm:px-4 sm:py-3.5">
      <span className="text-foreground text-xs font-semibold sm:text-sm">
        {title}
      </span>
      <p className="text-foreground/70 text-[11px] leading-snug sm:text-[13px]">
        {description}
      </p>
    </div>
  </div>
);
