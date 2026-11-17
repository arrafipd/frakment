"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteButton } from "@/components/site/button";
import { cn } from "@/lib/utils";

export const MainNav = ({
  items,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  items: { href: string; label: string }[];
}) => {
  const pathname = usePathname();

  return (
    <nav className={cn("items-center gap-0.5", className)} {...props}>
      {items.map((item) => (
        <SiteButton asChild key={item.href} size="sm" variant="ghost">
          <Link
            className={cn(pathname === item.href && "text-primary")}
            href={item.href}
            transitionTypes={["nav-forward"]}
          >
            {item.label}
          </Link>
        </SiteButton>
      ))}
    </nav>
  );
};
