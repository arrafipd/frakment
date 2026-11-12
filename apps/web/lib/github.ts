import { unstable_cache } from "next/cache";

import { GITHUB } from "@/constants/links";

interface Stargazer {
  avatar_url: string;
  login: string;
}

export interface Contributor {
  avatar_url: string;
  contributions: number;
  html_url: string;
  login: string;
  type?: string;
}

export const getContributors = unstable_cache(
  async (): Promise<Contributor[]> => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB.org}/${GITHUB.repo}/contributors?per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      if (!res.ok) {
        return [];
      }
      const data = (await res.json()) as Contributor[];
      return data.filter((c) => c.login !== GITHUB.user && c.type !== "Bot");
    } catch {
      return [];
    }
  },
  ["github-contributors"],
  { revalidate: 3600 }
);

export const getStargazers = unstable_cache(
  async (): Promise<Stargazer[]> => {
    try {
      const pages: Stargazer[] = [];
      let page = 1;

      while (page <= 5) {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB.org}/${GITHUB.repo}/stargazers?per_page=100&page=${page}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        if (!response.ok) {
          break;
        }

        const data: Stargazer[] = await response.json();
        if (data.length === 0) {
          break;
        }

        pages.push(...data);
        if (data.length < 100) {
          break;
        }
        page += 1;
      }

      return pages.filter((s) => s.login !== GITHUB.user);
    } catch {
      return [];
    }
  },
  ["github-stargazers"],
  { revalidate: 86_400 }
);

export const getStargazerCount = unstable_cache(
  async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB.org}/${GITHUB.repo}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (!response.ok) {
        return 0;
      }

      const json = (await response.json()) as { stargazers_count?: number };
      return Number(json.stargazers_count) || 0;
    } catch {
      return 0;
    }
  },
  ["github-stargazer-count"],
  { revalidate: 86_400 }
);
