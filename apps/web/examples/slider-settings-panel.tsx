import { Slider } from "@/components/ui/slider";

export function SliderSettingsPanel() {
  return (
    <div className="border-border mx-auto w-full max-w-sm space-y-6 rounded-lg border p-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Volume</span>
          <span className="text-muted-foreground tabular-nums">75</span>
        </div>
        <Slider defaultValue={[75]} max={100} step={1} />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Brightness</span>
          <span className="text-muted-foreground tabular-nums">60</span>
        </div>
        <Slider defaultValue={[60]} max={100} step={1} />
      </div>
    </div>
  );
}
