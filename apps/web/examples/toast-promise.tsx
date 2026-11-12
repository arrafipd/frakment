"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToastPromise() {
  function showToast() {
    const promise = new Promise<{ name: string }>((resolve) => {
      window.setTimeout(() => resolve({ name: "Event" }), 2000);
    });
    toast.promise(promise, {
      error: "Could not create event.",
      loading: "Creating event…",
      success: (data) => `${data.name} created.`,
    });
  }
  return (
    <Button onClick={showToast} variant="outline">
      Create Event
    </Button>
  );
}
