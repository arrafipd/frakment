import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";

export function AvatarImageFallback() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-6">
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
      </AvatarGroup>
      <AvatarGroup>
        <Avatar>
          <AvatarImage src="/avatars/missing-a.avif" />
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="/avatars/missing-b.avif" />
          <AvatarFallback>SA</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="/avatars/missing-c.avif" />
          <AvatarFallback>LV</AvatarFallback>
        </Avatar>
      </AvatarGroup>
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </div>
  );
}
