"use client";

import { ThemeIcon } from "@/components/site/icons";
import { Kbd } from "@/components/site/kbd";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export const ModeSwitcher = () => {
  const { toggleTheme } = useThemeToggle();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="group/toggle extend-touch-target size-8"
          onClick={toggleTheme}
          size="icon"
          title="Toggle theme"
          variant="ghost"
        >
          <ThemeIcon className="size-4.5" strokeWidth="2" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          Toggle Mode
          <Kbd>D</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
