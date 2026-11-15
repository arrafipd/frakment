import { Slider } from "@/components/ui/slider";

export function SliderPriceFilter() {
  return (
    <div className="border-border mx-auto w-full max-w-sm rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Price range</span>
        <span className="text-muted-foreground tabular-nums">$25 – $75</span>
      </div>
      <Slider defaultValue={[25, 75]} max={100} step={5} />
    </div>
  );
}
