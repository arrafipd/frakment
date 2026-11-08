import { Slider } from "@/components/ui/slider";

export function SliderRange() {
  return (
    <Slider
      className="mx-auto w-full max-w-xs"
      defaultValue={[25, 50]}
      max={100}
      step={5}
    />
  );
}
