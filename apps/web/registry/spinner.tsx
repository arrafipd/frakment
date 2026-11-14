import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({
  className,
  variant = "default",
  borderWidth,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "spoke";
  borderWidth?: number;
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
        data-variant="spoke"
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
        "inline-block size-4 shrink-0 animate-spin rounded-full border-current border-t-transparent",
        borderWidth === undefined ? "border-2" : "",
        className
      )}
      data-slot="spinner"
      role="status"
      style={
        borderWidth === undefined
          ? undefined
          : { borderWidth: `${borderWidth}px` }
      }
      {...props}
    />
  );
}

export { Spinner };
