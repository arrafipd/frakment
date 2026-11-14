import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";

export function AvatarContext() {
  return (
    <div className="w-full max-w-md space-y-3 p-6">
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/male-r.avif" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Assistant</MessageHeader>
          <Bubble>
            <BubbleContent>Reading your build log now.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/female-l-1.avif" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent>Thanks!</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  );
}
