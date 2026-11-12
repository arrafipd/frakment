export function ShimmerColor() {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
      <p className="shimmer shimmer-color-blue-500/60">
        Generating response&hellip;
      </p>
      <p
        className="shimmer"
        style={{ "--shimmer-color": "#378ADD" } as React.CSSProperties}
      >
        Generating response&hellip;
      </p>
    </div>
  );
}
