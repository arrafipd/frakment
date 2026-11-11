export function ShimmerNone() {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-3 text-sm">
      <p className="shimmer md:shimmer-none">Generating response&hellip;</p>
      <p className="font-mono text-xs">shimmer md:shimmer-none</p>
    </div>
  );
}
