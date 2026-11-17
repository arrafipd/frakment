function Items() {
  return (
    <div className="flex flex-col gap-1.5 p-1.5">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="bg-muted rounded-lg px-3 py-2.5 text-sm" key={i}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );
}
export function ScrollFadeNone() {
  return (
    <div className="mx-auto flex max-w-xs min-w-0 flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border">
        <div className="scroll-fade no-scrollbar h-48 overflow-y-auto">
          <Items />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <div className="scroll-fade no-scrollbar scroll-fade-none h-48 overflow-y-auto">
          <Items />
        </div>
      </div>
    </div>
  );
}
