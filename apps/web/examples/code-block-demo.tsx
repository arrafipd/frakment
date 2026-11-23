"use client";

import { DownloadIcon, WrapTextIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";

const code = `type ChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

export function createReply(message: ChatMessage) {
  return {
    id: "reply-" + message.id,
    role: "assistant" as const,
    text: "This response is generated locally.",
  }
}`;

function download(value: string, filename: string) {
  const url = URL.createObjectURL(new Blob([value], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CodeBlockDemo() {
  const [wrap, setWrap] = React.useState(false);
  const lines = useHighlightedCode(code, "ts");

  return (
    <div className="max-w-lg">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>app/api/chat/route.ts</CodeBlockTitle>
          <CodeBlockActions>
            <Button
              aria-label="Wrap lines"
              aria-pressed={wrap}
              className="aria-pressed:text-foreground"
              onClick={() => setWrap(!wrap)}
              size="icon-xs"
              variant="ghost"
            >
              <WrapTextIcon />
            </Button>
            <Button
              aria-label="Download"
              onClick={() => download(code, "route.ts")}
              size="icon-xs"
              variant="ghost"
            >
              <DownloadIcon />
            </Button>
            <CodeBlockCopyButton value={code} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers wrap={wrap}>
          {lines.map((line, index) => (
            <CodeBlockLine
              key={index}
              variant={index >= 5 && index <= 9 ? "highlighted" : "default"}
            >
              {line}
            </CodeBlockLine>
          ))}
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
