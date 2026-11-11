import { Separator } from "@/components/ui/separator";

export function SeparatorDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <div className="text-base leading-none font-medium">frakment</div>
        <div className="text-muted-foreground">
          Primitives for AI interfaces
        </div>
      </div>
      <Separator />
      <div>
        A set of beautifully designed components you can customize, extend, and
        build on —.
      </div>
    </div>
  );
}
