import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const;

export function SheetSide() {
  return (
    <div className="flex flex-wrap gap-2">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button className="capitalize" variant="outline">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent
            className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
            side={side}
          >
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you are done.
              </SheetDescription>
            </SheetHeader>
            <div className="no-scrollbar overflow-y-auto px-4">
              {[1, 2, 3].map((n) => (
                <p className="mb-2 leading-relaxed" key={n}>
                  Section {n}. The quick brown fox jumps over the lazy dog. Pack
                  my box with five dozen liquor jugs. How vexingly quick daft
                  zebras jump. Sphinx of black quartz, judge my vow. Two driven
                  jocks help fax my big quiz. The five boxing wizards jump
                  quickly. Jackdaws love my big sphinx of quartz. Bright vixens
                  jump; dozy fowl quack.
                </p>
              ))}
            </div>
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
