"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";

export function MessageDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 py-12">
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@me" src="/avatars/female-l-1.avif" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>Deploying to prod real quick.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@oliver" src="/avatars/male-r.avif" />
            <AvatarFallback>OL</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>It is 4:55 PM. On a Friday.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@me" src="/avatars/female-l-1.avif" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>It is a one-line change.</BubbleContent>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage alt="@oliver" src="/avatars/male-r.avif" />
            <AvatarFallback>OL</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent>It is always a one-line change.</BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>Alright, let me take a look.</BubbleContent>
              <BubbleReactions aria-label="Reactions: thumbs up">
                <span>👍</span>
              </BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
      </Message>
      <Marker role="status">
        <MarkerContent className="shimmer">
          <span className="font-medium">Oliver</span> is typing...
        </MarkerContent>
      </Marker>
    </div>
  );
}
