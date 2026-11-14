import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputEmail() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="you@example.com" type="email" />
    </div>
  );
}
