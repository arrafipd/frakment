"use client";

import { SiExpo } from "@icons-pack/react-simple-icons";
import Link from "next/link";

import { source } from "@/lib/source";
import { cn } from "@/lib/utils";

function WebIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m66.076 10.865l-.144 4.996c3.075.09 6.141.656 9.043 1.67l1.65-4.722a35.1 35.1 0 0 0-10.549-1.944m-5.369.254a34.8 34.8 0 0 0-10.32 2.945l2.1 4.54a29.8 29.8 0 0 1 8.835-2.524zm20.844 3.848l-2.352 4.414a29.8 29.8 0 0 1 7.342 5.525l3.586-3.486a34.8 34.8 0 0 0-8.576-6.453M31.67 19.289a35 35 0 0 0-5.299.926a35.4 35.4 0 0 0-5.092 1.72l1.955 4.602a30.3 30.3 0 0 1 8.914-2.271zm10.04.488q-.622.558-1.216 1.145c-.162.159-.317.324-.476.486q-.326.329-.641.666q-.314.34-.62.69a36 36 0 0 0-1.105 1.316l-.13.158h.005C32.822 30.198 30 37.708 30 45.875c0 15.41 10.01 28.518 23.87 33.178a35 35 0 0 0 4.42 1.17q.621-.558 1.216-1.145c.162-.159.317-.324.476-.486q.326-.328.641-.666q.314-.34.62-.69a36 36 0 0 0 1.105-1.316l.13-.158h-.005C67.178 69.802 70 62.292 70 54.125c0-15.41-10.01-28.518-23.87-33.178a35 35 0 0 0-4.42-1.17m-25.206 4.637a34.8 34.8 0 0 0-8.133 7.002l3.809 3.242a29.8 29.8 0 0 1 6.96-5.996zm77.066 1.129l-4.068 2.906a29.8 29.8 0 0 1 4.125 8.21l4.762-1.526a34.8 34.8 0 0 0-4.819-9.59M5.21 35.766a35.1 35.1 0 0 0-4.167 9.882l4.85 1.215a30.2 30.2 0 0 1 3.572-8.474zm94.423 4.6l-4.938.779c.481 3.036.488 6.154.028 9.197l4.943.748c.537-3.55.529-7.176-.033-10.725M.14 50.948c-.33 3.582-.1 7.205.678 10.712L5.7 60.578a29.8 29.8 0 0 1-.582-9.168zm93.547 3.889a29.8 29.8 0 0 1-4.06 8.242l4.09 2.877a34.8 34.8 0 0 0 4.743-9.629zM7.037 65l-4.665 1.8a34.8 34.8 0 0 0 5.365 9.298l3.893-3.141A29.8 29.8 0 0 1 7.037 65m79.655 1.637a30.3 30.3 0 0 1-7.312 5.582l2.389 4.392a35 35 0 0 0 4.513-2.927a35.4 35.4 0 0 0 4.012-3.579zm-11.52 7.465a30 30 0 0 1-9.027 1.728l.174 4.996a35 35 0 0 0 10.54-2.017zm-60.38 2.212l-3.365 3.698a35.1 35.1 0 0 0 8.941 5.92l2.092-4.543a30.1 30.1 0 0 1-7.668-5.075m34.377 4.272a30.3 30.3 0 0 1-8.682 3.047l.92 4.914a35.3 35.3 0 0 0 10.117-3.55zm-22.383 2.406l-1.375 4.809a34.8 34.8 0 0 0 10.649 1.328l-.157-4.998a29.8 29.8 0 0 1-9.117-1.139" />
    </svg>
  );
}

const BASES = [
  { icon: WebIcon, name: "web", title: "Web" },
  { icon: SiExpo, name: "native", title: "Native" },
] as const;

export function DocsBaseSwitcher({
  base,
  component,
  section = "components",
  className,
}: {
  base: string;
  component: string;
  section?: "components";
  className?: string;
}) {
  const activeBase = BASES.find((b) => b.name === base);
  const ActiveIcon = activeBase?.icon;

  return (
    <div
      className={cn(
        "not-typeset inline-flex w-full items-center gap-6",
        className
      )}
    >
      {BASES.filter((b) => source.getPage([section, b.name, component])).map(
        (b) => (
          <Link
            className="text-muted-foreground after:bg-foreground hover:text-foreground data-[active=true]:text-foreground relative inline-flex items-center justify-center gap-1 pt-1 pb-0.5 text-base font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:opacity-0 after:transition-opacity data-[active=true]:after:opacity-100"
            data-active={base === b.name}
            href={`/docs/${section}/${b.name}/${component}`}
            key={b.name}
          >
            {b.title}
          </Link>
        )
      )}
      {ActiveIcon && (
        <div className="text-muted-foreground ml-auto size-6 shrink-0 opacity-80">
          <ActiveIcon className={base === "expo" ? "size-5" : "size-6"} />
        </div>
      )}
    </div>
  );
}
