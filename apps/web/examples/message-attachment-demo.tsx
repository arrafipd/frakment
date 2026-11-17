import { DownloadIcon, FileTextIcon } from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Bubble,
  BubbleContent,
  Message,
  MessageContent,
} from "@/components/ui/message";

export function MessageAttachmentDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 py-6">
      <Message align="end">
        <MessageContent>
          <Attachment orientation="vertical">
            <AttachmentMedia variant="image">
              <img alt="Workspace" src="/examples/attachment/workspace.avif" />
            </AttachmentMedia>
          </Attachment>
          <Bubble>
            <BubbleContent>
              Here is the image. Can you add it to the PDF? Use it for the cover
              page.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>
              Done. Here is the PDF with the image added as the cover page.
            </BubbleContent>
          </Bubble>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
              <AttachmentDescription>PDF - 2.4 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                aria-label="Download"
                size="icon-sm"
                title="Download"
                type="button"
                variant="secondary"
              >
                <DownloadIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Thanks. Looks good.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  );
}
