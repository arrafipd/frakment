import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";

export function MessageDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 py-4">
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@me" src="/avatars/female-l-1.avif" />
            <AvatarFallback>{"ME"}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>{"Deploying to prod real quick."}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@rabbit" src="/avatars/male-r.avif" />
            <AvatarFallback>{"R"}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>{"It's 4:55 PM. On a Friday."}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@me" src="/avatars/female-l-1.avif" />
            <AvatarFallback>{"ME"}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>{"It's a one-line change."}</BubbleContent>
          </Bubble>
          <MessageFooter>{"Delivered"}</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@rabbit" src="/avatars/male-r.avif" />
            <AvatarFallback>{"R"}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent>
                {"It's always a one-line change 😭."}
              </BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>{"Alright, let me take a look."}</BubbleContent>
              <BubbleReactions aria-label="Reactions: thumbs up">
                <span>{"👍"}</span>
              </BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
      </Message>
      <Marker role="status">
        <MarkerContent>
          <span className="font-medium">{"Oliver"}</span>
          {" is typing..."}
        </MarkerContent>
      </Marker>
    </div>
  );
}
