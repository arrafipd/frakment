import { Badge } from "@/components/ui/badge";

export function BadgeCustomColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
        Success
      </Badge>
      <Badge className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
        Warning
      </Badge>
      <Badge className="border-transparent bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100">
        Danger
      </Badge>
      <Badge className="border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        Info
      </Badge>
    </div>
  );
}
