"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DialogConfirm() {
  return (
    <Dialog>
      <DialogTrigger as={Button} variant="destructive">
        Delete file
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this file?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose as={Button} variant="outline">
            Cancel
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
