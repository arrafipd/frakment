import type { Node as PageTreeNode } from "fumadocs-core/page-tree";
import type { InferPageType } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import type { ReactNode } from "react";

import { docs } from "@/.source/server";
import { NewDot } from "@/components/docs/new-dot";
import { ROUTES } from "@/constants/routes";
import { agentDocsDirectiveMarkdown } from "@/lib/agent-discovery/directive";
import { docsContentRoute, docsImageRoute, pagesNew } from "@/lib/docs";

const baseSource = loader({
  baseUrl: ROUTES.DOCS,
  source: docs.toFumadocsSource(),
});

// Decorate page names with a "new" dot indicator when the URL is in pagesNew.
const decorateName = (name: ReactNode, url: string): ReactNode =>
  pagesNew.has(url) ? (
    <>
      {name}
      <NewDot className="ml-auto" />
    </>
  ) : (
    name
  );

type PageNode = Extract<PageTreeNode, { type: "page" }>;
type FolderNode = Extract<PageTreeNode, { type: "folder" }>;

const decorateNode = (node: PageTreeNode): PageTreeNode => {
  if (node.type === "page") {
    return { ...node, name: decorateName(node.name, node.url) };
  }
  if (node.type === "folder") {
    const folder = node as FolderNode;
    return {
      ...folder,
      children: folder.children.map(decorateNode),
      index: folder.index
        ? (decorateNode(folder.index as PageNode) as PageNode)
        : undefined,
    };
  }
  return node;
};

export const source = {
  ...baseSource,
  pageTree: {
    ...baseSource.pageTree,
    children: baseSource.pageTree.children.map(decorateNode),
  },
} as typeof baseSource;

export const getPageImage = (page: InferPageType<typeof source>) => {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
};

export const getPageMarkdownUrl = (page: InferPageType<typeof source>) => {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
};

export const getLLMText = async (page: InferPageType<typeof source>) => {
  const processed = await page.data.getText("processed");

  const sections = [
    page.data.description,
    agentDocsDirectiveMarkdown,
    processed,
  ].filter(Boolean);

  return `# ${page.data.title}

${sections.join("\n\n")}`;
};
