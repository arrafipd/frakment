import { Switch } from "@/components/ui/switch";

export function SwitchFeatureFlag() {
  return (
    <div className="mx-auto flex w-full max-w-sm items-center justify-between">
      <div>
        <p className="text-sm font-medium">New editor</p>
        <p className="text-muted-foreground text-xs">
          Try the beta experience.
        </p>
      </div>
      <Switch />
    </div>
  );
}
