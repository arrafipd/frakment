import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

export function AvatarBadgeGroup() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="/avatars/female-l-1.avif" />
        <AvatarFallback>AN</AvatarFallback>
        <AvatarBadge className="bg-green-600 dark:bg-green-800">
          <span className="sr-only">Online</span>
        </AvatarBadge>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/female-l-2.avif" />
        <AvatarFallback>SA</AvatarFallback>
        <AvatarBadge className="bg-yellow-500 dark:bg-yellow-700">
          <span className="sr-only">Away</span>
        </AvatarBadge>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/male-l.avif" />
        <AvatarFallback>MX</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  );
}
