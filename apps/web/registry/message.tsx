"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  getTransition,
  parseMotion,
  useMotionGuard,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

interface UIMessagePart {
  text?: string;
  type: string;
}

interface UIMessage {
  id: string;
  metadata?: unknown;
  parts: UIMessagePart[];
  role: "user" | "assistant" | "system";
}

function getMessageText(message: UIMessage): string {
  if (!Array.isArray(message.parts)) {
    return "";
  }
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && typeof part.text === "string"
    )
    .map((part) => part.text)
    .join("");
}

function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-2", className)}
      data-slot="message-group"
      {...props}
    />
  );
}

function Message({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      className={cn(
        "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse",
        className
      )}
      data-align={align}
      data-slot="message"
      {...props}
    />
  );
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-muted flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full group-has-data-[slot=message-footer]/message:-translate-y-8",
        className
      )}
      data-slot="message-avatar"
      {...props}
    />
  );
}
function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
        className
      )}
      data-slot="message-content"
      {...props}
    />
  );
}

function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex max-w-full min-w-0 items-center px-3 text-xs font-medium group-has-data-[variant=ghost]/message:px-0",
        className
      )}
      data-slot="message-header"
      {...props}
    />
  );
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex max-w-full min-w-0 items-center px-3 text-xs font-medium group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
        className
      )}
      data-slot="message-footer"
      {...props}
    />
  );
}

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-2", className)}
      data-slot="bubble-group"
      {...props}
    />
  );
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30",
        ghost:
          "[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50 border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        tinted:
          "*:data-[slot=bubble-content]:text-foreground *:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
      },
    },
  }
);
function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end";
  }) {
  return (
    <div
      className={cn(bubbleVariants({ variant }), className)}
      data-align={align}
      data-slot="bubble"
      data-variant={variant}
      {...props}
    />
  );
}

type BubbleContentProps = Omit<React.ComponentProps<"div">, "ref"> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLDivElement>;
} & Record<string, unknown>;

function BubbleContent({ as, className, ref, ...props }: BubbleContentProps) {
  const Comp = as ?? "div";

  return (
    <Comp
      className={cn(
        "[button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-ring/50 w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:ring-3",
        className
      )}
      data-slot="bubble-content"
      ref={ref}
      {...props}
    />
  );
}
const bubbleReactionsVariants = cva(
  "bg-muted ring-card absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-sm ring-3 has-[button]:p-0",
  {
    defaultVariants: {
      align: "end",
      side: "bottom",
    },
    variants: {
      align: {
        end: "right-3",
        start: "left-3",
      },
      side: {
        bottom: "bottom-0 translate-y-3/4",
        top: "top-0 -translate-y-3/4",
      },
    },
  }
);

function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end";
  side?: "top" | "bottom";
}) {
  return (
    <div
      className={cn(bubbleReactionsVariants({ align, side }), className)}
      data-align={align}
      data-side={side}
      data-slot="bubble-reactions"
      {...props}
    />
  );
}

type ScrollDefaultPosition = "start" | "end" | "last-anchor";
type ScrollButtonDirection = "start" | "end";
type ScrollAlign = "start" | "center" | "end" | "nearest";

interface ScrollOptions {
  align?: ScrollAlign;
  behavior?: ScrollBehavior;
  scrollMargin?: number;
}
interface Scrollable {
  end: boolean;
  start: boolean;
}
interface VisibilityState {
  currentAnchorId: string | null;
  visibleMessageIds: string[];
}
interface ScrollerProviderProps {
  autoScroll?: boolean;
  children?: React.ReactNode;
  defaultScrollPosition?: ScrollDefaultPosition;
  scrollEdgeThreshold?: number;
  scrollMargin?: number;
  scrollPreviousItemPeek?: number;
}
type ScrollerProps = React.ComponentProps<"div">;
type ScrollerViewportProps = React.ComponentProps<"div"> & {
  preserveScrollOnPrepend?: boolean;
};
type ScrollerContentProps = React.ComponentProps<"div"> & {
  spacerClassName?: string;
};
type ScrollerItemProps = React.ComponentProps<"div"> & {
  messageId?: string;
  scrollAnchor?: boolean;
};
type ScrollerButtonDirection = ScrollButtonDirection;
type ScrollerButtonProps = Omit<
  React.ComponentProps<"button">,
  "children" | "render"
> & {
  children?: React.ReactNode;
  behavior?: ScrollBehavior;
  direction?: ScrollerButtonDirection;
  render?: React.ReactElement;
};
interface ScrollerContextValue {
  autoScroll: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  defaultScrollPosition: ScrollDefaultPosition;
  itemElements: Map<string, HTMLDivElement>;
  preserveScrollOnPrependRef: React.MutableRefObject<boolean>;
  registerItem: (id: string, el: HTMLDivElement) => () => void;
  scrollable: Scrollable;
  scrollEdgeThreshold: number;
  scrollMargin: number;
  scrollPreviousItemPeek: number;
  scrollToEnd: (opts?: ScrollOptions) => boolean;
  scrollToMessage: (messageId: string, opts?: ScrollOptions) => boolean;
  scrollToStart: (opts?: ScrollOptions) => boolean;
  setContentPresent: (present: boolean) => void;
  setPreserveScrollOnPrepend: (v: boolean) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  visibility: VisibilityState;
}

const ScrollerContext = React.createContext<ScrollerContextValue | null>(null);

function useScrollerContext(): ScrollerContextValue {
  const ctx = React.useContext(ScrollerContext);
  if (!ctx) {
    throw new Error(
      "MessageScroller components must be used within <MessageScroller.Provider>"
    );
  }
  return ctx;
}

function ScrollerProvider({
  children,
  autoScroll = true,
  defaultScrollPosition = "end",
  scrollEdgeThreshold = 16,
  scrollPreviousItemPeek = 40,
  scrollMargin = 0,
}: ScrollerProviderProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const itemElements = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const preserveScrollOnPrependRef = React.useRef(false);
  const [contentPresent, setContentPresent] = React.useState(false);
  const [scrollable, setScrollable] = React.useState<Scrollable>({
    end: false,
    start: false,
  });
  const [visibility, setVisibility] = React.useState<VisibilityState>({
    currentAnchorId: null,
    visibleMessageIds: [],
  });

  const setPreserveScrollOnPrepend = React.useCallback((v: boolean) => {
    preserveScrollOnPrependRef.current = v;
  }, []);

  const registerItem = React.useCallback((id: string, el: HTMLDivElement) => {
    itemElements.current.set(id, el);
    return () => {
      itemElements.current.delete(id);
    };
  }, []);

  const computeScrollable = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    const start = vp.scrollTop > scrollEdgeThreshold;
    const end =
      vp.scrollHeight - vp.clientHeight - vp.scrollTop > scrollEdgeThreshold;
    setScrollable((prev) =>
      prev.start === start && prev.end === end ? prev : { end, start }
    );
  }, [scrollEdgeThreshold]);

  const computeVisibility = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    const vpRect = vp.getBoundingClientRect();
    const visible: string[] = [];
    let currentAnchorId: string | null = null;
    let bestTop = Number.POSITIVE_INFINITY;
    itemElements.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > vpRect.top && r.top < vpRect.bottom) {
        visible.push(id);
        if (r.top >= vpRect.top - 1 && r.top < bestTop) {
          bestTop = r.top;
          currentAnchorId = id;
        }
      }
    });
    setVisibility((prev) => {
      if (
        prev.currentAnchorId === currentAnchorId &&
        prev.visibleMessageIds.length === visible.length &&
        prev.visibleMessageIds.every((v, i) => v === visible[i])
      ) {
        return prev;
      }
      return { currentAnchorId, visibleMessageIds: visible };
    });
  }, []);

  const onScroll = React.useCallback(() => {
    computeScrollable();
    computeVisibility();
  }, [computeScrollable, computeVisibility]);
  const scrollToEnd = React.useCallback((opts?: ScrollOptions) => {
    const vp = viewportRef.current;
    if (!vp) {
      return false;
    }
    vp.scrollTo({ behavior: opts?.behavior ?? "smooth", top: vp.scrollHeight });
    return true;
  }, []);

  const scrollToStart = React.useCallback((opts?: ScrollOptions) => {
    const vp = viewportRef.current;
    if (!vp) {
      return false;
    }
    vp.scrollTo({ behavior: opts?.behavior ?? "smooth", top: 0 });
    return true;
  }, []);

  const scrollToMessage = React.useCallback(
    (messageId: string, opts?: ScrollOptions) => {
      const el = itemElements.current.get(messageId);
      if (!el) {
        return false;
      }
      el.scrollIntoView({
        behavior: opts?.behavior ?? "smooth",
        block: opts?.align ?? "start",
        inline: "nearest",
      });
      return true;
    },
    []
  );

  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    vp.addEventListener("scroll", onScroll, { passive: true });
    computeScrollable();
    computeVisibility();
    return () => vp.removeEventListener("scroll", onScroll);
  }, [onScroll, computeScrollable, computeVisibility]);

  React.useEffect(() => {
    if (!contentPresent) {
      return;
    }
    const vp = viewportRef.current;
    if (!vp) {
      return;
    }
    if (defaultScrollPosition === "start") {
      vp.scrollTop = 0;
    } else if (defaultScrollPosition === "end") {
      vp.scrollTop = vp.scrollHeight;
    }
  }, [contentPresent, defaultScrollPosition]);

  const value: ScrollerContextValue = {
    autoScroll,
    contentRef,
    defaultScrollPosition,
    itemElements: itemElements.current,
    preserveScrollOnPrependRef,
    registerItem,
    scrollable,
    scrollEdgeThreshold,
    scrollMargin,
    scrollPreviousItemPeek,
    scrollToEnd,
    scrollToMessage,
    scrollToStart,
    setContentPresent,
    setPreserveScrollOnPrepend,
    viewportRef,
    visibility,
  };

  return (
    <ScrollerContext.Provider value={value}>
      {children}
    </ScrollerContext.Provider>
  );
}
function ScrollerRoot({ children, ...props }: ScrollerProps) {
  return <div {...props}>{children}</div>;
}

function ScrollerViewport({
  children,
  onScroll,
  preserveScrollOnPrepend,
  ref,
  ...props
}: ScrollerViewportProps) {
  const ctx = useScrollerContext();
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      ctx.viewportRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ctx.viewportRef, ref]
  );

  React.useEffect(() => {
    if (preserveScrollOnPrepend !== undefined) {
      ctx.setPreserveScrollOnPrepend(preserveScrollOnPrepend);
    }
  }, [preserveScrollOnPrepend, ctx]);

  return (
    <div onScroll={onScroll} ref={setRef} {...props}>
      {children}
    </div>
  );
}

function ScrollerContent({ children, ...props }: ScrollerContentProps) {
  const ctx = useScrollerContext();

  React.useEffect(() => {
    ctx.setContentPresent(true);
    return () => ctx.setContentPresent(false);
  }, [ctx]);

  return (
    <div ref={ctx.contentRef} {...props}>
      {children}
    </div>
  );
}

function ScrollerItem({
  messageId,
  scrollAnchor,
  children,
  ref,
  ...props
}: ScrollerItemProps) {
  const ctx = useScrollerContext();
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  React.useEffect(() => {
    if (!(messageId && localRef.current)) {
      return;
    }
    return ctx.registerItem(messageId, localRef.current);
  }, [messageId, ctx]);

  return (
    <div
      data-scroll-anchor={scrollAnchor ? "true" : undefined}
      ref={setRef}
      {...props}
    >
      {children}
    </div>
  );
}
function ScrollerButton({
  direction = "end",
  behavior = "smooth",
  onClick,
  render,
  children,
  type = "button",
  ...props
}: ScrollerButtonProps) {
  const ctx = useScrollerContext();
  const active =
    direction === "end" ? ctx.scrollable.end : ctx.scrollable.start;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }
    if (direction === "end") {
      ctx.scrollToEnd({ behavior });
    } else {
      ctx.scrollToStart({ behavior });
    }
  };

  const mergedProps = {
    ...props,
    children,
    "data-active": active ? "true" : "false",
    "data-direction": direction,
    onClick: handleClick,
    type,
  } as React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;

  if (render && React.isValidElement(render)) {
    return React.cloneElement(
      render as React.ReactElement<Record<string, unknown>>,
      mergedProps
    );
  }

  return <button {...mergedProps} />;
}

function useMessageScroller() {
  const ctx = useScrollerContext();
  return {
    scrollToEnd: ctx.scrollToEnd,
    scrollToMessage: ctx.scrollToMessage,
    scrollToStart: ctx.scrollToStart,
  };
}

function useMessageScrollerScrollable() {
  return useScrollerContext().scrollable;
}

function useMessageScrollerVisibility() {
  return useScrollerContext().visibility;
}

function MessageScrollerProvider(props: ScrollerProviderProps) {
  return <ScrollerProvider {...props} />;
}

function MessageScroller({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollerRoot
      className={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className
      )}
      data-slot="message-scroller"
      {...props}
    />
  );
}

function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<"div"> & { preserveScrollOnPrepend?: boolean }) {
  return (
    <ScrollerViewport
      className={cn(
        "scroll-fade-b size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain contain-content data-pending-scroll:invisible",
        className
      )}
      data-slot="message-scroller-viewport"
      {...props}
    />
  );
}

function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ScrollerContent
      className={cn("flex h-max min-h-full flex-col gap-6", className)}
      data-slot="message-scroller-content"
      {...props}
    />
  );
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<"div"> & {
  messageId?: string;
  scrollAnchor?: boolean;
}) {
  return (
    <ScrollerItem
      className={cn(
        "min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        className
      )}
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      {...props}
    />
  );
}

function MessageScrollerButton({
  direction = "end",
  className,
  children,
  render,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<"button"> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size"> & {
    direction?: "start" | "end";
    render?: React.ReactElement;
    behavior?: ScrollBehavior;
  }) {
  return (
    <ScrollerButton
      className={cn(
        "border-border bg-background text-foreground hover:bg-muted hover:text-foreground absolute inset-s-1/2 -translate-x-1/2 transition-[translate,scale,opacity] duration-200 data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
        className
      )}
      data-direction={direction}
      data-size={size}
      data-slot="message-scroller-button"
      data-variant={variant}
      direction={direction}
      render={
        render ?? (
          <Button className="rounded-full" size={size} variant={variant} />
        )
      }
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">
            {direction === "end" ? "Scroll to end" : "Scroll to start"}
          </span>
        </>
      )}
    </ScrollerButton>
  );
}

const defaultMessageAnimatedMotion = "200 ease-out";

interface MessageAnimatedProps {
  message: UIMessage;
  motion?: string;
  scrollAnchor?: boolean;
}

function MessageAnimated({
  message,
  motion,
  scrollAnchor,
}: MessageAnimatedProps) {
  const text = getMessageText(message);
  const isUser = message.role === "user";
  const reduce = useReducedMotion();
  const motionValue = motion ?? defaultMessageAnimatedMotion;
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      if (raf1) {
        cancelAnimationFrame(raf1);
      }
      if (raf2) {
        cancelAnimationFrame(raf2);
      }
    };
  }, []);

  let resolvedStyle: React.CSSProperties = {
    opacity: reduce ? 1 : entered ? 1 : 0,
    transform: reduce ? "none" : entered ? "translateY(0)" : "translateY(8px)",
  };

  if (reduce) {
    resolvedStyle.transition = "none";
  } else {
    const transition = getTransition(parseMotion(motionValue));
    if (transition) {
      resolvedStyle.transition = transition;
    }
  }

  const motionEnabled = !reduce;
  const styleFingerprint = JSON.stringify(resolvedStyle);
  const yielded = useMotionGuard(internalRef, motionEnabled, styleFingerprint);
  if (yielded && !reduce) {
    resolvedStyle = { ...resolvedStyle, transition: "none" };
  }

  return (
    <MessageScrollerItem scrollAnchor={scrollAnchor}>
      <div className="flex flex-col" ref={internalRef} style={resolvedStyle}>
        <Bubble
          align={isUser ? "end" : "start"}
          variant={isUser ? "muted" : "ghost"}
        >
          <BubbleContent className="whitespace-pre-wrap">{text}</BubbleContent>
        </Bubble>
      </div>
    </MessageScrollerItem>
  );
}

export type { UIMessage, UIMessagePart };
export {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  Message,
  MessageAnimated,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};
