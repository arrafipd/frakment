import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { isComponentsFolder, PAGES_NEW } from "@/lib/docs";
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
    return pages.filter((page) => PAGES_NEW.has(page.url));
  }
  return pages.filter((page) => !PAGES_NEW.has(page.url));
};

export const ComponentsList = ({
  folderName = "Components",
  filter = "all",
}: {
  folderName?: string;
  filter?: Filter;
}) => {
  const folder = getFolder(folderName);
  if (!folder) {
    return null;
  }

  const allPages = isComponentsFolder(folder)
    ? getAllPagesFromFolder(folder).filter(
        (page) => page.url !== ROUTES.DOCS_COMPONENTS
      )
    : getPagesFromFolder(folder);

  const pages = applyFilter(allPages, filter);
  if (pages.length === 0) {
    return null;
  }

  return <ComponentGrid pages={pages} />;
};
