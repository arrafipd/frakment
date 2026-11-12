"use client";

import * as React from "react";
import type { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Questionnaire as QuestionnairePrimitive } from "@/lib/questionnaire";
import { buttonVariants, cn } from "@/lib/utils";

function Questionnaire({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Root>) {
  return (
    <QuestionnairePrimitive.Root
      className={cn("flex w-full min-w-0 flex-col gap-4", className)}
      data-slot="questionnaire"
      {...props}
    />
  );
}

function QuestionnaireProgress({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Progress>) {
  return (
    <QuestionnairePrimitive.Progress
      className={cn(
        "text-muted-foreground min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium tabular-nums",
        className
      )}
      data-slot="questionnaire-progress"
      {...props}
    />
  );
}

function QuestionnaireItem({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Item>) {
  return (
    <QuestionnairePrimitive.Item
      className={cn(
        "flex min-w-0 flex-col gap-4 border-0 p-0 outline-none",
        className
      )}
      data-slot="questionnaire-item"
      {...props}
    />
  );
}

function QuestionnaireTitle({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Title>) {
  return (
    <QuestionnairePrimitive.Title
      className={cn(
        "text-base leading-snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
        className
      )}
      data-slot="questionnaire-title"
      {...props}
    />
  );
}

function QuestionnaireDescription({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Description>) {
  return (
    <QuestionnairePrimitive.Description
      className={cn("text-muted-foreground text-sm text-pretty", className)}
      data-slot="questionnaire-description"
      {...props}
    />
  );
}

function QuestionnaireChoices({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices>) {
  return (
    <QuestionnairePrimitive.Choices
      className={cn(
        "group/questionnaire-choices grid min-w-0 gap-2",
        className
      )}
      data-slot="questionnaire-choices"
      {...props}
    />
  );
}

function QuestionnaireChoice({
  children,
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice>) {
  const [checked, setChecked] = React.useState(false);
  const [multiple, setMultiple] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    setMultiple(input.type === "checkbox");
    setChecked(input.checked);
    const sync = () => setChecked(input.checked);
    input.addEventListener("change", sync);
    return () => input.removeEventListener("change", sync);
  }, []);

  return (
    <QuestionnairePrimitive.Choice
      className={cn(
        "group/questionnaire-choice border-input hover:bg-muted/50 relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none",
        checked && "border-primary bg-muted dark:bg-muted",
        className
      )}
      data-slot="questionnaire-choice"
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        className="sr-only"
        data-slot="questionnaire-choice-input"
        ref={inputRef}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none mt-0.5 flex shrink-0"
        data-slot="questionnaire-choice-indicator"
      >
        {multiple ? (
          <Checkbox aria-hidden checked={checked} tabIndex={-1} />
        ) : (
          <RadioGroup
            aria-hidden
            className="contents"
            onValueChange={() => {
              // noop — parent Choice handles interaction
            }}
            value={checked ? "on" : ""}
          >
            <RadioGroupItem
              className="pointer-events-none"
              tabIndex={-1}
              value="on"
            />
          </RadioGroup>
        )}
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
        data-slot="questionnaire-choice-label"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        className="border-input bg-background text-muted-foreground pointer-events-none ms-auto hidden size-5 shrink-0 items-center justify-center rounded-md border font-mono text-[0.625rem] leading-none font-medium group-data-[shortcut]/questionnaire-choice:inline-flex"
        data-slot="questionnaire-choice-shortcut"
      />
    </QuestionnairePrimitive.Choice>
  );
}

function QuestionnaireChoiceDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-muted-foreground", className)}
      data-slot="questionnaire-choice-description"
      {...props}
    />
  );
}

function QuestionnaireInput({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input>) {
  return (
    <div
      className="group/questionnaire-input relative w-full min-w-0"
      data-slot="questionnaire-input-wrapper"
    >
      <QuestionnairePrimitive.Input
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 min-h-11 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 sm:min-h-0 md:text-sm",
          "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
          className
        )}
        data-slot="questionnaire-input"
        {...props}
      />
    </div>
  );
}

function QuestionnaireError({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Error>) {
  return (
    <QuestionnairePrimitive.Error
      className={cn("text-destructive mt-2 text-sm", className)}
      data-slot="questionnaire-error"
      {...props}
    />
  );
}

function QuestionnaireActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-8",
        className
      )}
      data-slot="questionnaire-actions"
      {...props}
    />
  );
}

function QuestionnairePrevious({
  children,
  className,
  size = "default",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Previous> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Previous
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0",
        className
      )}
      data-size={size}
      data-slot="questionnaire-previous"
      data-variant={variant}
      {...props}
    >
      {children ?? "Previous"}
    </QuestionnairePrimitive.Previous>
  );
}

function QuestionnaireSkip({
  children,
  className,
  size = "default",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Skip> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Skip
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0",
        className
      )}
      data-size={size}
      data-slot="questionnaire-skip"
      data-variant={variant}
      {...props}
    >
      {children ?? "Skip"}
    </QuestionnairePrimitive.Skip>
  );
}

function QuestionnaireNext({
  children,
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Next> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Next
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
        className
      )}
      data-size={size}
      data-slot="questionnaire-next"
      data-variant={variant}
      {...props}
    >
      {children ?? "Next"}
    </QuestionnairePrimitive.Next>
  );
}

function QuestionnaireSubmit({
  children,
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Submit> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Submit
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
        className
      )}
      data-size={size}
      data-slot="questionnaire-submit"
      data-variant={variant}
      {...props}
    >
      {children ?? "Submit"}
    </QuestionnairePrimitive.Submit>
  );
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
