"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function ItemSettings() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Item variant="outline">
        <ItemMedia>
          <span className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
            AR
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jane Doe</ItemTitle>
          <ItemDescription>john@example.com</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </ItemActions>
      </Item>
    </div>
  );
}
