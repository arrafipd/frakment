"use client";

import {
  RotateCwIcon as ArrowClockwiseIcon,
  ArrowUpIcon,
  Globe,
  Image,
  MessageCircleDashedIcon,
  Paperclip,
  PlusIcon,
  TelescopeIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  MessageAnimated,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DemoMessage {
  id: string;
  parts: Array<{ type: "text"; text: string }>;
  role: "user" | "assistant";
}

interface ScriptTurn {
  role: "user" | "assistant";
  text: string;
}

const SCRIPT: ScriptTurn[] = [
  {
    role: "user",
    text: "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around.",
  },
  {
    role: "assistant",
    text: "That's the classic streaming scroll problem. Wrap your message list in MessageScroller and turn on autoScroll. The viewport pins to the bottom as tokens arrive, so users always see the latest text land in place. It only auto-scrolls while the reader is already at the bottom. The moment they scroll up, auto-scroll backs off and their position is preserved.",
  },
  {
    role: "user",
    text: "Okay, but when someone sends a new message the view still feels jarring, like the whole conversation reloads from the top.",
  },
  {
    role: "assistant",
    text: "MessageScrollerItem fixes that with turn anchoring. Set scrollAnchor on the turn that should settle near the top instead of snapping to the document bottom. It also leaves a small peek of the previous exchange visible above the anchor, so context isn't lost.",
  },
  {
    role: "user",
    text: "And if they've scrolled up to re-read an older answer? I don't want to yank them back down.",
  },
  {
    role: "assistant",
    text: "You won't. Auto-scroll only runs when the viewport is already pinned to the bottom, so scrolling up is a deliberate opt-out. When there is content they haven't seen yet, MessageScrollerButton appears at the bottom. One tap jumps them back to the newest message and re-engages auto-scroll.",
  },
  {
    role: "user",
    text: "Last one, does this work with assistive tech?",
  },
  {
    role: "assistant",
    text: "MessageScrollerContent sets role=log and aria-relevant=additions by default, so screen readers announce new messages as they stream in. The scroll button is a real button with an sr-only label, and it's removed from the tab order when you're already at the bottom.",
  },
];

const INITIAL: DemoMessage[] = [];

export function MessageScrollerDemo() {
  const [messages, setMessages] = React.useState<DemoMessage[]>(INITIAL);
  const [busy, setBusy] = React.useState(false);
  const [pairIndex, setPairIndex] = React.useState(0);

  const streamAssistant = async (id: string, text: string) => {
    const tokens = text.split(/(\s+)/);
    let acc = "";
    for (const token of tokens) {
      await new Promise((r) => setTimeout(r, 25));
      acc += token;
      const snapshot = acc;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === id
            ? { ...msg, parts: [{ text: snapshot, type: "text" }] }
            : msg
        )
      );
    }
  };
  const reset = () => {
    setMessages(INITIAL);
    setPairIndex(0);
    setBusy(false);
  };

  const send = async () => {
    if (busy) {
      return;
    }
    if (pairIndex >= 4) {
      return;
    }
    const userTurn = SCRIPT[pairIndex * 2];
    const assistantTurn = SCRIPT[pairIndex * 2 + 1];
    const uid = `u-${pairIndex}`;
    const aid = `a-${pairIndex}`;
    setBusy(true);
    setMessages((m) => [
      ...m,
      { id: uid, parts: [{ text: userTurn.text, type: "text" }], role: "user" },
    ]);
    await new Promise((r) => setTimeout(r, 400));
    setMessages((m) => [
      ...m,
      { id: aid, parts: [{ text: "", type: "text" }], role: "assistant" },
    ]);
    await streamAssistant(aid, assistantTurn.text);
    setPairIndex(pairIndex + 1);
    setBusy(false);
  };

  const nextUser =
    pairIndex >= 4 ? null : (SCRIPT[pairIndex * 2]?.text ?? null);
  return (
    <MessageScrollerProvider>
      <div className="relative flex flex-col gap-4">
        <Card className="mx-auto h-140 w-full max-w-sm gap-0 rounded-2xl">
          <CardHeader className="gap-1">
            <CardTitle>New Chat</CardTitle>
            <CardDescription>How can I help you today?</CardDescription>
            <CardAction>
              <Tooltip>
                <TooltipTrigger
                  aria-label="Reset conversation"
                  as={Button}
                  className="rounded-full"
                  disabled={busy}
                  onClick={reset}
                  size="icon-sm"
                  variant="outline"
                >
                  <ArrowClockwiseIcon />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {messages.length === 0 ? (
              <Empty className="h-full rounded-2xl">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleDashedIcon />
                  </EmptyMedia>
                  <EmptyTitle>Morning, frakment!</EmptyTitle>
                  <EmptyDescription>
                    What are we working on today? Press send to start a new
                    conversation
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent
                    aria-busy={busy}
                    className="p-(--card-spacing)"
                  >
                    {messages.map((message) => (
                      <MessageAnimated
                        key={message.id}
                        message={message}
                        scrollAnchor={message.role === "user"}
                      />
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 border-t-0 bg-transparent">
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <InputGroup className="rounded-2xl border-0 focus-within:border-0 focus-within:ring-0">
                <div className="h-14 w-full px-3 py-2.5">
                  <span
                    className="line-clamp-2 opacity-60 data-[status=ready]:opacity-100"
                    data-status={busy ? "streaming" : "ready"}
                  >
                    {nextUser ? (
                      nextUser
                    ) : (
                      <span className="text-muted-foreground">
                        No messages queued. Reset the conversation.
                      </span>
                    )}
                  </span>
                </div>
                <InputGroupAddon align="block-end" className="pt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Add files"
                      as={InputGroupButton}
                      className="rounded-full"
                      size="icon-sm"
                      type="button"
                      variant="outline"
                    >
                      <PlusIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-44"
                      side="top"
                    >
                      <DropdownMenuItem>
                        <Paperclip />
                        Add Photos & Files
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Image />
                        Create Image
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TelescopeIcon />
                        Deep Research
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Globe />
                        Web Search
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <InputGroupButton
                    className="ml-auto rounded-full"
                    disabled={!nextUser || busy}
                    size="icon-sm"
                    type="submit"
                    variant="default"
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
        <div className="text-muted-foreground px-0.5 text-center text-xs">
          Demo is read only. Press send to send messages.
        </div>
      </div>
    </MessageScrollerProvider>
  );
}
