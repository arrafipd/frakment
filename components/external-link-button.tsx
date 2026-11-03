"use client";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

interface ExternalLinkButtonProps extends ButtonProps {
  href: string;
}

export const ExternalLinkButton = ({
  href,
  children,
  ...props
}: ExternalLinkButtonProps) => (
  <Button asChild {...props}>
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  </Button>
);
