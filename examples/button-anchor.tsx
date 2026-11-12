import { Button } from "@/components/ui/button";

export function ButtonAnchor() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button href="/docs" size="sm" variant="secondary">
        Read the docs
      </Button>
      <Button
        href="https://github.com/arrafipd/frakment"
        rel="noopener noreferrer"
        size="sm"
        target="_blank"
        variant="outline"
      >
        GitHub
      </Button>
    </div>
  );
}
