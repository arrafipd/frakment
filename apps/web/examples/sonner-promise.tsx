"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function SonnerPromise() {
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
