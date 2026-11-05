"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Folder } from "@/lib/icons";

export function EmptyOutline() {
  return (
    <Empty className="max-w-sm border">
      <EmptyHeader>
        <EmptyMedia>
          <Folder />
        </EmptyMedia>
        <EmptyTitle>Nothing here</EmptyTitle>
        <EmptyDescription>
          Use variant="default" to render media without a background.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
