"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockStartLineDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent
          lineNumbers
          startLine={20}
        >{`  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    messages,
  })

return result.toUIMessageStreamResponse()`}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
