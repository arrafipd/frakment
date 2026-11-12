"use client";

import { SiteButton, type SiteButtonProps } from "@/components/site/button";

interface ExternalLinkButtonProps extends SiteButtonProps {
  href: string;
}

export const ExternalLinkButton = ({
  href,
  children,
  ...props
}: ExternalLinkButtonProps) => (
  <SiteButton asChild {...props}>
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  </SiteButton>
);
