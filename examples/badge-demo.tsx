import { Badge } from "@/components/ui/badge";
import {
  CircleCheckIcon,
  ClockIcon,
  GitPullRequestIcon,
  RocketIcon,
  TriangleAlertIcon,
} from "@/lib/icons";

export function BadgeDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Deployment status
        </span>
        <div className="flex flex-wrap gap-2">
          <Badge>
            <CircleCheckIcon />
            Deployed
          </Badge>
          <Badge variant="secondary">
            <ClockIcon />
            Building
          </Badge>
          <Badge variant="destructive">
            <TriangleAlertIcon />
            Failed
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Pull requests
        </span>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <GitPullRequestIcon />
            #128
          </Badge>
          <Badge variant="secondary">3 open</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Latest release
        </span>
        <div className="flex items-center gap-2">
          <Badge>
            <RocketIcon />
            v1.2.3
          </Badge>
          <span className="text-muted-foreground text-sm">2 minutes ago</span>
        </div>
      </div>
    </div>
  );
}
