import { Separator } from "@/components/ui/separator";

export function SeparatorDecorative() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 text-sm">
      <p>Section one</p>
      <Separator decorative={false} />
      <p>Section two</p>
    </div>
  );
}
