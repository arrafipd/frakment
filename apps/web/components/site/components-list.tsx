import Link from "next/link";

import { isComponentsFolder, normalizeActivePath, pagesNew } from "@/lib/docs";
import type { PageTreeFolder, PageTreePage } from "@/lib/page-tree";
import { getAllPagesFromFolder, getPagesFromFolder } from "@/lib/page-tree";
import { source } from "@/lib/source";

type Filter = "all" | "new" | "current";

const getFolder = (name: string): PageTreeFolder | undefined => {
  for (const node of source.pageTree.children) {
    if (node.type === "folder" && node.name === name) {
      return node;
    }
  }
};

const ComponentGrid = ({ pages }: { pages: PageTreePage[] }) => (
  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
    {pages.map((component) => (
      <Link
        className="inline-flex w-fit items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
        href={component.url}
        key={component.$id}
        transitionTypes={["nav-forward"]}
      >
        {component.name}
      </Link>
    ))}
  </div>
);

const applyFilter = (pages: PageTreePage[], filter: Filter): PageTreePage[] => {
  if (filter === "all") {
    return pages;
  }
  if (filter === "new") {
    return pages.filter((page) => pagesNew.has(normalizeActivePath(page.url)));
  }
  return pages.filter((page) => !pagesNew.has(normalizeActivePath(page.url)));
};

export const ComponentsList = ({
  folderName = "Components",
  filter = "all",
  header,
}: {
  folderName?: string;
  filter?: Filter;
  header?: string;
}) => {
  const folder = getFolder(folderName);
  if (!folder) {
    return null;
  }

  const indexUrl = folder.index?.url;
  const allPages = (
    isComponentsFolder(folder)
      ? getAllPagesFromFolder(folder)
      : getPagesFromFolder(folder)
  ).filter((page) => page.url !== indexUrl);

  const pages = applyFilter(allPages, filter);
  if (pages.length === 0) {
    return null;
  }

  return (
    <>
      {header && (
        <h2 className="font-heading mt-8 text-xl font-medium tracking-tight">
          {header}
        </h2>
      )}
      <ComponentGrid pages={pages} />
    </>
  );
};
