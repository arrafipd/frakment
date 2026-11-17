import { Switch } from "@/components/ui/switch";

export function SwitchAnatomy() {
  return (
    <div className="flex items-center gap-3">
      <Switch defaultChecked id="a" />
      <label className="text-sm" htmlFor="a">
        On
      </label>
      <Switch id="b" />
      <label className="text-sm" htmlFor="b">
        Off
      </label>
    </div>
  );
}
