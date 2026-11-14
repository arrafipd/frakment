import { Input } from "@/components/ui/input";

export function InputAnatomy() {
  return (
    <div className="flex flex-col gap-2">
      <Input placeholder="Empty" />
      <Input defaultValue="Filled" />
      <Input aria-invalid placeholder="Invalid" />
    </div>
  );
}
