"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToastDemo() {
  function showToast() {
    toast("Event created", {
      action: {
        label: "Undo",
        onClick: () => toast.dismiss(),
      },
      description: "Sunday, December 3 at 9:00 AM",
    });
  }
  return (
    <Button onClick={showToast} variant="outline">
      Show Toast
    </Button>
  );
}
