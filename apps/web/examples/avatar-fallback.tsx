import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarFallbackDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/avatars/female-l-1.avif" />
        <AvatarFallback>AN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/missing.avif" />
        <AvatarFallback>SA</AvatarFallback>
      </Avatar>
    </div>
  );
}
