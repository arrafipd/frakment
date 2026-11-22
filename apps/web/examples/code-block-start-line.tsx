"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockStartLineDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent
          lineNumbers
          startLine={20}
        >{`  const reply = createReply(message)

  setMessages((current) => [
    ...current,
    reply,
  ])`}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
