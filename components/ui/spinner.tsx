import { LoaderCircleIcon, LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"svg"> & {
  variant?: "default" | "spoke";
}) {
  const Icon = variant === "spoke" ? LoaderIcon : LoaderCircleIcon;
  return (
    <Icon
      aria-label="Loading"
      className={cn(
        "inline-block size-4 shrink-0 animate-spin align-middle",
        className
      )}
      data-slot="spinner"
      role="status"
      {...props}
    />
  );
}

export { Spinner };
