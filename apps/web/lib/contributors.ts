export interface Contributor {
  avatar_url: string;
  contributions: number;
  html_url: string;
  login: string;
  type?: string;
}

export const mergeContributors = (
  contributorGroups: readonly (readonly Contributor[])[],
  excludedLogin: string
): Contributor[] => {
  const contributorsByLogin = new Map<string, Contributor>();
  const excludedLoginKey = excludedLogin.toLowerCase();

  for (const group of contributorGroups) {
    for (const contributor of group) {
      const loginKey = contributor.login.toLowerCase();
      if (
        loginKey === excludedLoginKey ||
        contributor.type?.toLowerCase() === "bot"
      ) {
        continue;
      }

      const existing = contributorsByLogin.get(loginKey);
      if (existing) {
        existing.contributions += contributor.contributions;
      } else {
        contributorsByLogin.set(loginKey, { ...contributor });
      }
    }
  }

  return [...contributorsByLogin.values()].sort(
    (a, b) =>
      b.contributions - a.contributions || a.login.localeCompare(b.login)
  );
};
