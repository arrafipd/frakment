"use client";

import { GithubIcon } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LINK } from "@/constants/links";
import { UTM_PARAMS } from "@/constants/site";
import { useFeedback } from "@/hooks/use-feedback";
import { addQueryParams } from "@/lib/url";
import { buttonVariants, cn } from "@/lib/utils";

const formatStars = (count: number): string => {
  if (count >= 1000) {
    const k = count / 1000;
    const formatted =
      k >= 10 ? Math.round(k).toString() : k.toFixed(1).replace(/\.0$/u, "");
    return `${formatted}K+`;
  }
  return count.toString();
};
export const GitHubStars = ({
  stargazersCount,
}: {
  stargazersCount: number;
}) => {
  const play = useFeedback({ sound: "success" });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          aria-label="GitHub repository"
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
          href={addQueryParams(LINK.GITHUB, UTM_PARAMS)}
          onClick={play}
          rel="noopener"
          target="_blank"
        >
          <GithubIcon className="-translate-y-px" />
          {stargazersCount >= 100 && (
            <span className="text-muted-foreground text-xs tabular-nums">
              {formatStars(stargazersCount)}
            </span>
          )}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        {new Intl.NumberFormat("en-US").format(stargazersCount)} stars
      </TooltipContent>
    </Tooltip>
  );
};
