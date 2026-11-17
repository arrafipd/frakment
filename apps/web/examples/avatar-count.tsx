import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

export function AvatarCount() {
  return (
    <AvatarGroup>
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
      <Avatar>
        <AvatarImage src="/avatars/male-l.avif" />
        <AvatarFallback>MX</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  );
}
