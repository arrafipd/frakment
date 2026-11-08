export function ShimmerDuration() {
  return (
    <div className="text-muted-foreground mx-auto grid w-full max-w-lg gap-6 text-center text-sm sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="shimmer">Generating response&hellip;</p>
        <p className="font-mono text-xs">default</p>
      </div>
      <div className="flex flex-col gap-3">
        <p
          className="shimmer"
          style={{ "--shimmer-duration": "1s" } as React.CSSProperties}
        >
          Generating response&hellip;
        </p>
        <p className="font-mono text-xs">--shimmer-duration: 1s</p>
      </div>
    </div>
  );
}
