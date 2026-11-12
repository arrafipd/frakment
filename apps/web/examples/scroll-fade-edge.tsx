const items = [
  "Inbox triage",
  "Design review",
  "API contract",
  "QA pass",
  "Launch notes",
  "Metrics follow-up",
];
const tags = [
  "Design",
  "Engineering",
  "Marketing",
  "Product",
  "Research",
  "Sales",
  "Support",
  "Operations",
];
function Items() {
  return (
    <div className="flex flex-col gap-1.5 p-1.5">
      {items.map((item) => (
        <div className="bg-muted rounded-lg px-3 py-2.5 text-sm" key={item}>
          {item}
        </div>
      ))}
    </div>
  );
}
function Tags() {
  return (
    <div className="flex w-max gap-1.5 p-1.5">
      {tags.map((tag) => (
        <div
          className="bg-muted shrink-0 rounded-lg px-3 py-2.5 text-sm"
          key={tag}
        >
          {tag}
        </div>
      ))}
    </div>
  );
}
export function ScrollFadeEdge() {
  return (
    <div className="mx-auto flex max-w-xs min-w-0 flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border">
        <div className="scroll-fade-t no-scrollbar h-36 overflow-y-auto">
          <Items />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <div className="scroll-fade-b no-scrollbar h-36 overflow-y-auto">
          <Items />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <div className="scroll-fade-s no-scrollbar overflow-x-auto">
          <Tags />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <div className="scroll-fade-e no-scrollbar overflow-x-auto">
          <Tags />
        </div>
      </div>
    </div>
  );
}
