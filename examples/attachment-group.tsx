import {
  FileCodeIcon,
  FileTextIcon,
  type LucideIcon,
  TableIcon,
  XIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

interface Item {
  icon?: LucideIcon;
  meta: string;
  name: string;
  src?: string;
}

const items: Item[] = [
  { icon: FileTextIcon, meta: "PDF · 1.4 MB", name: "briefing-notes.pdf" },
  {
    meta: "AVIF · 39 KB",
    name: "workspace.avif",
    src: "/examples/attachment/workspace.avif",
  },
  { icon: TableIcon, meta: "CSV · 18 KB", name: "customers.csv" },
  { icon: FileCodeIcon, meta: "TSX · 12 KB", name: "renderer.tsx" },
];

export function AttachmentGroupDemo() {
  return (
    <div className="mx-auto w-full max-w-sm py-12">
      <AttachmentGroup
        className="w-full"
        style={{
          maskImage:
            "linear-gradient(to right, black 0, black calc(100% - 16px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0, black calc(100% - 16px), transparent 100%)",
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Attachment className="w-64" key={item.name}>
              {item.src ? (
                <AttachmentMedia variant="image">
                  <img alt={item.name} src={item.src} />
                </AttachmentMedia>
              ) : Icon ? (
                <AttachmentMedia>
                  <Icon />
                </AttachmentMedia>
              ) : null}
              <AttachmentContent>
                <AttachmentTitle>{item.name}</AttachmentTitle>
                <AttachmentDescription>{item.meta}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label={`Remove ${item.name}`}>
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          );
        })}
      </AttachmentGroup>
    </div>
  );
}
