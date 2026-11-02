"use client";

import type { UIMessage } from "ai";
import { motion } from "motion/react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import { getMessageText } from "@/lib/ai";

export function MessageAnimated({
  message,
  scrollAnchor,
}: {
  message: UIMessage;
  scrollAnchor?: boolean;
}) {
  const text = getMessageText(message);
  const isUser = message.role === "user";

  return (
    <MessageScrollerItem scrollAnchor={scrollAnchor}>
      <motion.div
        className="flex flex-col"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Bubble
          align={isUser ? "end" : "start"}
          variant={isUser ? "default" : "ghost"}
        >
          <BubbleContent className="whitespace-pre-wrap">{text}</BubbleContent>
        </Bubble>
      </motion.div>
    </MessageScrollerItem>
  );
}
