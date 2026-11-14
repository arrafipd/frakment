import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";

export function AvatarGroupDemo() {
  return (
    <AvatarGroup aria-label="3 participants">
      <Avatar>
        <AvatarImage src="/avatars/female-l-1.avif" />
        <AvatarFallback>AN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/female-l-2.avif" />
        <AvatarFallback>SA</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/female-l-3.avif" />
        <AvatarFallback>LV</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  );
}
