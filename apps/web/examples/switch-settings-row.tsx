import { Switch } from "@/components/ui/switch";

export function SwitchSettingsRow() {
  return (
    <div className="mx-auto flex w-full max-w-sm items-center justify-between">
      <div>
        <p className="text-sm font-medium">Notifications</p>
        <p className="text-muted-foreground text-xs">
          Get an email on replies.
        </p>
      </div>
      <Switch defaultChecked />
    </div>
  );
}
