"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

import type { ArrowLeftIconHandle } from "@/components/animated-icons/arrow-left";
import { ArrowLeftIcon } from "@/components/animated-icons/arrow-left";
import type { ArrowRightIconHandle } from "@/components/animated-icons/arrow-right";
import { ArrowRightIcon } from "@/components/animated-icons/arrow-right";
import { SiteButton } from "@/components/site/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const DocsNavLink = ({
  href,
  children,
  className,
  tooltip,
  transitionTypes,
  size = "icon",
  ...props
}: React.ComponentProps<typeof SiteButton> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  tooltip?: { title: string; icon: React.ReactNode };
  transitionTypes?: string[];
}) => {
  const iconRef = useRef<ArrowLeftIconHandle | ArrowRightIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    iconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    iconRef.current?.stopAnimation();
  }, []);

  const link = (
    <SiteButton
      asChild
      className={cn("shadow-none", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      size={size}
      variant="secondary"
      {...props}
    >
      <Link href={href} transitionTypes={transitionTypes}>
        {transitionTypes?.includes("nav-back") && (
          <ArrowLeftIcon ref={iconRef} />
        )}
        {children}
        {transitionTypes?.includes("nav-forward") && (
          <ArrowRightIcon ref={iconRef} />
        )}
      </Link>
    </SiteButton>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent className="pr-2 pl-3">
          <div className="flex items-center gap-3">
            {tooltip.title}
            {tooltip.icon && <Kbd>{tooltip.icon}</Kbd>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};
