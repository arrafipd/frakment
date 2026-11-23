import { describe, expect, it } from "vitest";

import { mergeContributors } from "@/lib/contributors";

describe("mergeContributors", () => {
  it("deduplicates logins across repositories and sums contributions", () => {
    const first = {
      avatar_url: "https://avatars.githubusercontent.com/u/1",
      contributions: 3,
      html_url: "https://github.com/alex",
      login: "Alex",
    };
    const duplicate = {
      ...first,
      contributions: 4,
      login: "alex",
    };

    expect(mergeContributors([[first], [duplicate]], "arrafipd")).toEqual([
      { ...first, contributions: 7 },
    ]);
  });

  it("excludes the owner and bots, then sorts by total contributions", () => {
    const contributors = [
      {
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        contributions: 2,
        html_url: "https://github.com/alex",
        login: "alex",
      },
      {
        avatar_url: "https://avatars.githubusercontent.com/u/2",
        contributions: 8,
        html_url: "https://github.com/bot",
        login: "bot",
        type: "Bot",
      },
      {
        avatar_url: "https://avatars.githubusercontent.com/u/3",
        contributions: 10,
        html_url: "https://github.com/arrafipd",
        login: "arrafipd",
      },
      {
        avatar_url: "https://avatars.githubusercontent.com/u/4",
        contributions: 5,
        html_url: "https://github.com/sam",
        login: "sam",
      },
    ];

    expect(
      mergeContributors([contributors], "arrafipd").map((c) => c.login)
    ).toEqual(["sam", "alex"]);
  });
});
