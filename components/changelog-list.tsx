import Link from "next/link";

import { getChangelogPages } from "@/lib/changelog";

const ChangelogGrid = ({
  pages,
}: {
  pages: { url: string; title: string }[];
}) => (
  <div className="not-prose mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
    {pages.map((page) => (
      <Link
        className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
        href={page.url}
        key={page.url}
        transitionTypes={["nav-forward"]}
      >
        {page.title}
      </Link>
    ))}
  </div>
);

export const ChangelogList = () => {
  const pages = getChangelogPages().map((page) => ({
    title: page.data.title,
    url: page.url,
  }));

  if (pages.length === 0) {
    return null;
  }

  return <ChangelogGrid pages={pages} />;
};
