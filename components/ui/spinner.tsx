import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "spoke";
}) {
  if (variant === "spoke") {
    return (
      <span
        aria-label="Loading"
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center",
          className
        )}
        data-slot="spinner"
        role="status"
        {...props}
      >
        <span className="block size-full [transform-origin:center] animate-spin [transform-box:view-box]">
          <LoaderIcon className="block size-full [shape-rendering:geometricPrecision]" />
        </span>
      </span>
    );
  }

  return (
    <span
      aria-label="Loading"
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      data-slot="spinner"
      role="status"
      {...props}
    />
  );
}

export { Spinner };
