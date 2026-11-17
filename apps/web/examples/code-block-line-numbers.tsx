"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockLineNumbersDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent
          lineNumbers
        >{`import { Button } from "@/components/ui/button"

export default function Page() {
  return <Button>Click me</Button>
}`}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
