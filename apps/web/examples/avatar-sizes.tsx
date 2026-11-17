import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

export function AvatarSizes() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-6">
      <AvatarGroup>
        <Avatar size="sm">
          <AvatarImage src="/avatars/female-l-1.avif" />
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarImage src="/avatars/female-l-2.avif" />
          <AvatarFallback>SA</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarImage src="/avatars/female-l-3.avif" />
          <AvatarFallback>LV</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
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
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup>
        <Avatar size="lg">
          <AvatarImage src="/avatars/female-l-1.avif" />
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src="/avatars/female-l-2.avif" />
          <AvatarFallback>SA</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src="/avatars/female-l-3.avif" />
          <AvatarFallback>LV</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
