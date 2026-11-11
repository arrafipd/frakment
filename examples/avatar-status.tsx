import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const people = [
  {
    alt: "@anna",
    color: "bg-green-600 dark:bg-green-800",
    initials: "AN",
    src: "/avatars/female-l-1.avif",
    status: "Online",
  },
  {
    alt: "@sara",
    color: "bg-yellow-500 dark:bg-yellow-700",
    initials: "SA",
    src: "/avatars/female-l-2.avif",
    status: "Away",
  },
  {
    alt: "@liv",
    color: "bg-red-600 dark:bg-red-800",
    initials: "LV",
    src: "/avatars/female-l-3.avif",
    status: "Busy",
  },
];

export function AvatarStatusDemo() {
  return (
    <div className="flex items-center gap-4">
      {people.map((person) => (
        <Avatar key={person.alt}>
          <AvatarImage alt={person.alt} src={person.src} />
          <AvatarFallback>{person.initials}</AvatarFallback>
          <AvatarBadge className={person.color}>
            <span className="sr-only">{person.status}</span>
          </AvatarBadge>
        </Avatar>
      ))}
    </div>
  );
}
