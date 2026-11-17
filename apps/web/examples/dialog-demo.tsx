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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function DialogDemo() {
  return (
    <Dialog>
      <form>
        <DialogTrigger as={Button} type="button" variant="outline">
          Open Dialog
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name-1">Name</FieldLabel>
              <Input defaultValue="Pedro Duarte" id="name-1" name="name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="username-1">Username</FieldLabel>
              <Input defaultValue="@peduarte" id="username-1" name="username" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose as={Button} variant="outline">
              Cancel
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
