"use client";

import { XIcon } from "lucide-react";

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

const images = [
  {
    alt: "Workspace",
    meta: "AVIF · 42 KB",
    name: "workspace.avif",
    src: "/examples/attachment/workspace.avif",
  },
  {
    alt: "Desk",
    meta: "AVIF · 14 KB",
    name: "desk-reference.avif",
    src: "/examples/attachment/desk-reference.avif",
  },
  {
    alt: "Office",
    meta: "AVIF · 38 KB",
    name: "office-reference.avif",
    src: "/examples/attachment/office-reference.avif",
  },
];

export function AttachmentImage() {
  return (
    <div className="mx-auto w-full max-w-sm py-12">
      <AttachmentGroup className="w-full">
        {images.map((image) => (
          <a
            aria-label={`Open ${image.name}`}
            className="block"
            href={image.src}
            key={image.name}
            rel="noreferrer"
            target="_blank"
          >
            <Attachment orientation="vertical">
              <AttachmentMedia variant="image">
                <img alt={image.alt} src={image.src} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{image.name}</AttachmentTitle>
                <AttachmentDescription>{image.meta}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label={`Remove ${image.name}`}>
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </a>
        ))}
      </AttachmentGroup>
    </div>
  );
}
