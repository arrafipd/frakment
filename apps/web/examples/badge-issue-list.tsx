import { Badge } from "@/components/ui/badge";

export function BadgeIssueList() {
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="border-border flex items-start justify-between gap-3 rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Registry fails to install</p>
          <p className="text-muted-foreground text-xs">
            #142 · opened 2 days ago
          </p>
        </div>
        <Badge variant="destructive">Bug</Badge>
      </div>
      <div className="border-border flex items-start justify-between gap-3 rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Add dark mode toggle</p>
          <p className="text-muted-foreground text-xs">
            #141 · opened 3 days ago
          </p>
        </div>
        <Badge variant="outline">Feature</Badge>
      </div>
      <div className="border-border flex items-start justify-between gap-3 rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Update installation docs</p>
          <p className="text-muted-foreground text-xs">
            #140 · opened 5 days ago
          </p>
        </div>
        <Badge variant="secondary">Docs</Badge>
      </div>
    </div>
  );
}
