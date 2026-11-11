import {
  CircleCheckIcon,
  CircleIcon,
  ListChecksIcon,
  ListTodoIcon,
} from "lucide-react";

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

const todos: { title: string; description?: string; done: boolean }[] = [
  {
    description: "Cover the renamed props and the new data attributes.",
    done: true,
    title: "Write the migration guide",
  },
  { done: true, title: "Add a changeset" },
  {
    description: "It is clipped by overflow-hidden on the field.",
    done: false,
    title: "Fix the focus ring on the select trigger",
  },
  { done: false, title: "Update the registry snapshots" },
  {
    description: "Typing, clearing and keyboard selection.",
    done: false,
    title: "Add tests for the combobox",
  },
];

function TodoRow({ todo }: { todo: (typeof todos)[number] }) {
  const line = (
    <TraceLine>
      <TraceIcon>{todo.done ? <CircleCheckIcon /> : <CircleIcon />}</TraceIcon>
      <TraceTitle>{todo.title}</TraceTitle>
    </TraceLine>
  );

  if (!todo.description) {
    return line;
  }

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>{todo.description}</TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function QueueDescriptions() {
  const pending = todos.filter((todo) => !todo.done);
  const completed = todos.filter((todo) => todo.done);

  return (
    <Trace className="max-w-sm">
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <ListTodoIcon />
            </TraceIcon>
            <TraceTitle>{pending.length} to do</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent keepMounted>
          <Trace>
            {pending.map((todo) => (
              <TodoRow key={todo.title} todo={todo} />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <ListChecksIcon />
            </TraceIcon>
            <TraceTitle>{completed.length} completed</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent keepMounted>
          <Trace>
            {completed.map((todo) => (
              <TodoRow key={todo.title} todo={todo} />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
