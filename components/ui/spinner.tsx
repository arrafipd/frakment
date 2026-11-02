import { LoaderCircleIcon, LoaderIcon } from "@/lib/icons";

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
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-4 shrink-0 align-middle animate-spin",
        className
      )}
      {...props}
    />
  );
}

export { Spinner };
