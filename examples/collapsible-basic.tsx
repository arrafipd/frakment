import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "@/lib/icons";

export function CollapsibleBasic() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardContent>
        <Collapsible className="data-[state=open]:bg-muted rounded-md">
          <CollapsibleTrigger asChild>
            <Button className="w-full justify-between" variant="ghost">
              Product details
              <ChevronDownIcon className="transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
            <div>
              This panel can be expanded or collapsed to reveal additional
              content.
            </div>
            <Button size="sm">Learn more</Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
