import { Spinner } from "@/components/ui/spinner";

const SIZES = [
  { className: "size-3", label: "Small" },
  { className: "size-4", label: "Default" },
  { className: "size-8", label: "Large" },
];

export function SpinnerSizes() {
  return (
    <div className="flex items-center gap-8">
      {SIZES.map(({ label, className }) => (
        <div className="flex flex-col items-center gap-2" key={label}>
          <Spinner className={className} />
          <span className="text-muted-foreground text-xs">{label}</span>
        </div>
      ))}
    </div>
  );
}
