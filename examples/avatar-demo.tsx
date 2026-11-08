import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

export function AvatarDemo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-6 md:gap-12">
      <Avatar>
        <AvatarImage
          alt="@me"
          className="grayscale"
          src="/avatars/female-l-1.avif"
        />
        <AvatarFallback>{"ME"}</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage alt="@rabbit" src="/avatars/male-l.avif" />
        <AvatarFallback>{"R"}</AvatarFallback>
        <AvatarBadge className="bg-green-600 dark:bg-green-800" />
      </Avatar>
      <AvatarGroup className="grayscale">
        <Avatar>
          <AvatarImage alt="@anna" src="/avatars/female-l-1.avif" />
          <AvatarFallback>{"AN"}</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage alt="@sara" src="/avatars/female-l-2.avif" />
          <AvatarFallback>{"SA"}</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage alt="@liv" src="/avatars/female-l-3.avif" />
          <AvatarFallback>{"LV"}</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>{"+3"}</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
