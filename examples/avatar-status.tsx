import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const people = [
  {
    alt: "@anna",
    src: "/avatars/female-l-1.avif",
    initials: "AN",
    status: "Online",
    color: "bg-green-600 dark:bg-green-800",
  },
  {
    alt: "@sara",
    src: "/avatars/female-l-2.avif",
    initials: "SA",
    status: "Away",
    color: "bg-yellow-500 dark:bg-yellow-700",
  },
  {
    alt: "@liv",
    src: "/avatars/female-l-3.avif",
    initials: "LV",
    status: "Busy",
    color: "bg-red-600 dark:bg-red-800",
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
