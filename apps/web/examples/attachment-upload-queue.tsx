import { FileCodeIcon, FileTextIcon } from "lucide-react";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";

export function AttachmentUploadQueue() {
  return (
    <div className="border-border mx-auto flex w-full max-w-sm flex-col gap-2 rounded-lg border p-3">
      <Attachment className="w-full" state="uploading">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>brief.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading · 42%</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment className="w-full">
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>notes.md</AttachmentTitle>
          <AttachmentDescription>Markdown · 4 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment className="w-full">
        <AttachmentMedia>
          <FileCodeIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>renderer.tsx</AttachmentTitle>
          <AttachmentDescription>TypeScript · 12 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
