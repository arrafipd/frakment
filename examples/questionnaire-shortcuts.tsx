"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const items = [
  {
    choices: [{ value: "inspect" }, { value: "tests" }, { value: "patch" }],
    name: "action",
    required: true,
  },
] as const;

type ShortcutMode = React.ComponentProps<typeof Questionnaire>["shortcuts"];

export function QuestionnaireShortcuts() {
  const [shortcuts, setShortcuts] = React.useState<ShortcutMode>("letters");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = new FormData(event.currentTarget).get("action");
    toast("Next action selected", {
      description: `Action: ${action ?? "None"} · Shortcuts: ${shortcuts ?? "none"}`,
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col gap-6">
      <div className="flex items-center justify-end">
        <Select
          onValueChange={(value) => {
            setShortcuts(
              value === "letters" || value === "numbers" ? value : undefined
            );
          }}
          value={shortcuts ?? "none"}
        >
          <SelectTrigger aria-label="Shortcut style" className="w-36" size="sm">
            <SelectValue placeholder="Shortcuts" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="none">No shortcuts</SelectItem>
            <SelectItem value="letters">Letters</SelectItem>
            <SelectItem value="numbers">Numbers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Questionnaire
        className="mt-auto"
        items={items}
        onSubmit={handleSubmit}
        shortcuts={shortcuts}
      >
        <QuestionnaireItem name="action" required>
          <QuestionnaireTitle>
            What should the agent do next?
          </QuestionnaireTitle>
          <QuestionnaireDescription>
            Use the displayed shortcut or navigate with the keyboard.
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="inspect">
              Inspect the implementation
            </QuestionnaireChoice>
            <QuestionnaireChoice value="tests">
              Run the relevant tests
            </QuestionnaireChoice>
            <QuestionnaireChoice value="patch">
              Prepare the patch
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>

        <QuestionnaireActions>
          <QuestionnaireSubmit>Confirm action</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
}
