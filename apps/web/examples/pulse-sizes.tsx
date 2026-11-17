import Pulse from "@/components/ui/pulse";

const SIZES = [
  { className: "max-w-sm", days: 14, label: "Small" },
  { className: "max-w-xl", days: 30, label: "Default" },
  { className: "max-w-3xl", days: 90, label: "Large" },
];

export function PulseSizes() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {SIZES.map(({ label, className, days }) => (
        <Pulse
          className={className}
          days={days}
          key={label}
          title={`${label} range`}
        />
      ))}
    </div>
  );
}
