"use client";

import { MessageCircleDashedIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyZeroData() {
  return (
    <Empty className="mx-auto h-64 w-full max-w-sm">
      <EmptyHeader>
        <EmptyMedia>
          <MessageCircleDashedIcon />
        </EmptyMedia>
        <EmptyTitle>No messages</EmptyTitle>
        <EmptyDescription>
          Start a new conversation to see it here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
