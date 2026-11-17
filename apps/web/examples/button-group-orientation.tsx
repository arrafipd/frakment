import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function ButtonGroupOrientation() {
  return (
    <ButtonGroup
      aria-label="Media controls"
      className="h-fit"
      orientation="vertical"
    >
      <Button size="icon" variant="outline">
        <PlusIcon />
      </Button>
      <Button size="icon" variant="outline">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  );
}
