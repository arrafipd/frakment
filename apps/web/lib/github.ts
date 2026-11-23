import { unstable_cache } from "next/cache";

import { GITHUB } from "@/config/links";
import type { Contributor } from "@/lib/contributors";
import { mergeContributors } from "@/lib/contributors";

interface Stargazer {
  avatar_url: string;
  login: string;
}

interface GitHubRepository {
  fork: boolean;
  full_name: string;
}

const getGitHubHeaders = () => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
};

const fetchOrganizationRepositories = async (): Promise<GitHubRepository[]> => {
  const repositories: GitHubRepository[] = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/orgs/${GITHUB.org}/repos?type=public&per_page=100&page=${page}`;

    try {
      const response = await fetch(url, { headers: getGitHubHeaders() });
      if (!response.ok) {
        console.error(
          `GitHub returned ${response.status} while listing ${GITHUB.org} repositories.`
        );
        break;
      }

      const data = (await response.json()) as GitHubRepository[];
      repositories.push(...data.filter((repository) => !repository.fork));
      if (data.length < 100) {
        break;
      }

      page += 1;
    } catch (error) {
      console.error(
        `Failed to list ${GITHUB.org} repositories from GitHub.`,
        error
      );
      break;
    }
  }

  return repositories.sort((a, b) => a.full_name.localeCompare(b.full_name));
};

const fetchRepositoryContributors = async (
  repository: GitHubRepository
): Promise<Contributor[]> => {
  const url = `https://api.github.com/repos/${repository.full_name}/contributors?per_page=100`;

  try {
    const response = await fetch(url, { headers: getGitHubHeaders() });
    if (!response.ok) {
      console.error(
        `GitHub returned ${response.status} while listing contributors for ${repository.full_name}.`
      );
      return [];
    }

    return (await response.json()) as Contributor[];
  } catch (error) {
    console.error(
      `Failed to fetch contributors for ${repository.full_name} from GitHub.`,
      error
    );
    return [];
  }
};

export const getContributors = unstable_cache(
  async (): Promise<Contributor[]> => {
    const repositories = await fetchOrganizationRepositories();
    const contributorGroups: Contributor[][] = [];

    for (let offset = 0; offset < repositories.length; offset += 5) {
      const batch = repositories.slice(offset, offset + 5);
      contributorGroups.push(
        ...(await Promise.all(batch.map(fetchRepositoryContributors)))
      );
    }

    return mergeContributors(contributorGroups, GITHUB.user);
  },
  ["github-organization-contributors"],
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
