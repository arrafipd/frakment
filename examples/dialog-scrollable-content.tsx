import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DialogScrollableContent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Scrollable Content</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scrollable Content</DialogTitle>
          <DialogDescription>
            This is a dialog with scrollable content.
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <p className="mb-4 leading-normal" key={n}>
              Section {n}. The quick brown fox jumps over the lazy dog. Pack my
              box with five dozen liquor jugs. How vexingly quick daft zebras
              jump. Sphinx of black quartz, judge my vow. Two driven jocks help
              fax my big quiz. The five boxing wizards jump quickly. Jackdaws
              love my big sphinx of quartz. Bright vixens jump; dozy fowl quack.
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
