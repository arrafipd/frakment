import { cn } from "@/lib/utils";

export const NewDot = ({ className }: { className?: string } = {}) => (
  <span
    aria-label="New"
    className={cn("size-1.5 shrink-0 rounded-full bg-blue-500", className)}
  />
);
