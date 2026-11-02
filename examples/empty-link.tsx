"use client";

import { Folder } from "@/lib/icons";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyLink() {
  return (
    <Empty className="w-full max-w-sm border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Folder />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          <a href="#docs">Read the guide</a> to learn how to create one.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
