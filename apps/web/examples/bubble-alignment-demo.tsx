import { Bubble, BubbleContent } from "@/components/ui/message";

export function BubbleAlignmentDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 py-6">
      <Bubble variant="muted">
        <BubbleContent>
          This bubble is aligned to the start. This is the default alignment.
        </BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>
          This bubble is aligned to the end. Use this for user messages.
        </BubbleContent>
      </Bubble>
    </div>
  );
}
