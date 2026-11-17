import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function CollapsibleDetails() {
  return (
    <Collapsible className="mx-auto w-full max-w-sm">
      <CollapsibleTrigger className="text-sm font-medium">
        Show details
      </CollapsibleTrigger>
      <CollapsibleContent className="text-muted-foreground pt-2 text-sm">
        Frakment ships every component as a local file. Update by re-running the
        CLI and diffing.
      </CollapsibleContent>
    </Collapsible>
  );
}
