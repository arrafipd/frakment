"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/lib/icons";

export function ToastPosition() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-2">
      <Button
        onClick={() =>
          toast("Event created", {
            action: { label: "Undo", onClick: () => toast.dismiss() },
            description: "Sunday, December 3 at 9:00 AM",
            position: "top-left",
          })
        }
        variant="outline"
      >
        <ArrowUpLeftIcon /> Deploy
      </Button>
      <Button
        onClick={() =>
          toast("Event created", {
            action: { label: "Undo", onClick: () => toast.dismiss() },
            description: "Sunday, December 3 at 9:00 AM",
            position: "top-center",
          })
        }
        variant="outline"
      >
        <ChevronUpIcon /> Digest
      </Button>
      <Button
        onClick={() =>
          toast("Event created", {
            action: { label: "Undo", onClick: () => toast.dismiss() },
            description: "Sunday, December 3 at 9:00 AM",
            position: "top-right",
          })
        }
        variant="outline"
      >
        <ArrowUpRightIcon /> Review
      </Button>
      <Button
        onClick={() =>
          toast("Event created", {
            action: { label: "Undo", onClick: () => toast.dismiss() },
            description: "Sunday, December 3 at 9:00 AM",
            position: "bottom-left",
          })
        }
        variant="outline"
      >
        <ArrowDownLeftIcon /> Save
      </Button>
      <Button
        onClick={() =>
          toast("Event created", {
            action: { label: "Undo", onClick: () => toast.dismiss() },
            description: "Sunday, December 3 at 9:00 AM",
            position: "bottom-center",
          })
        }
        variant="outline"
      >
        <ChevronDownIcon /> Storage
      </Button>
      <Button
        onClick={() =>
          toast("Event created", {
            action: { label: "Undo", onClick: () => toast.dismiss() },
            description: "Sunday, December 3 at 9:00 AM",
            position: "bottom-right",
          })
        }
        variant="outline"
      >
        <ArrowDownRightIcon /> Billing
      </Button>
    </div>
  );
}
