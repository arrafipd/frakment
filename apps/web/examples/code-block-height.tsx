"use client";

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";

export function CodeBlockHeightDemo() {
  return (
    <div className="w-full max-w-lg">
      <CodeBlock>
        <CodeBlockContent
          className="max-h-40"
          lineNumbers
        >{`✓ Compiled successfully in 2.1s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (12/12)
✓ Finalizing page optimization

Route (app) Size First Load JS
┌ ○ / 1.2 kB 90.2 kB
├ ○ /_not-found 875 B 88.9 kB
├ ○ /docs 3.4 kB 92.4 kB
└ ○ /docs/components 5.1 kB 94.1 kB

- First Load JS shared by all 88.1 kB
  ├ chunks/1a2b3c.js 45.2 kB
  ├ chunks/4d5e6f.js 32.9 kB
  └ chunks/7g8h9i.js 10.0 kB`}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
