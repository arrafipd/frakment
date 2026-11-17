import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { rehypePrettyCode } from "rehype-pretty-code";
import { docsDir } from "@/lib/docs";
import { transformers } from "@/lib/highlight-code";
import { remarkFrakmentCommand } from "@/lib/remark-frakment-command";

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light-default",
          },
          transformers,
        },
      ]);

      return plugins;
    },
    remarkPlugins: (plugins) => {
      plugins.push(remarkFrakmentCommand);
      return plugins;
    },
  },
});

export const docs = defineDocs({
  dir: docsDir,
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});
