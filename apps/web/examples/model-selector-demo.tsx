"use client";

import { ArrowUpIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const providers = [
  {
    models: [
      { id: "gpt-5", name: "GPT-5" },
      { id: "gpt-5-mini", name: "GPT-5 mini" },
    ],
    name: "OpenAI",
  },
  {
    models: [
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
    ],
    name: "Anthropic",
  },
];

const models = providers.flatMap((provider) => provider.models);

const efforts = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
];

export function ModelSelectorDemo() {
  const [text, setText] = React.useState("");
  const [model, setModel] = React.useState(models[0].id);
  const [effort, setEffort] = React.useState(efforts[1].id);
  const formRef = React.useRef<HTMLFormElement>(null);
  const currentModel = models.find((item) => item.id === model) ?? models[0];
  const currentEffort =
    efforts.find((item) => item.id === effort) ?? efforts[1];
  const canSend = text.trim().length > 0;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    setText("");
  }

  return (
    <div className="mx-auto w-full max-w-lg py-6">
      <form onSubmit={onSubmit} ref={formRef}>
        <InputGroup>
          <InputGroupTextarea
            className="p-3"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            placeholder="Ask the agent to change your code..."
            value={text}
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              aria-label="Attach"
              className="rounded-full"
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <PlusIcon />
            </InputGroupButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Model: ${currentModel.name}`}
                as={InputGroupButton}
                className="ml-auto"
                size="sm"
                variant="outline"
              >
                {currentModel.name}
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup onValueChange={setModel} value={model}>
                  {providers.map((provider, index) => (
                    <React.Fragment key={provider.name}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{provider.name}</DropdownMenuLabel>
                        {provider.models.map((item) => (
                          <DropdownMenuRadioItem key={item.id} value={item.id}>
                            {item.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuGroup>
                    </React.Fragment>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Effort: ${currentEffort.name}`}
                as={InputGroupButton}
                size="sm"
                variant="outline"
              >
                <span className="text-muted-foreground">Effort</span>
                {currentEffort.name}
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Effort</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    onValueChange={setEffort}
                    value={effort}
                  >
                    {efforts.map((item) => (
                      <DropdownMenuRadioItem key={item.id} value={item.id}>
                        {item.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupButton
              aria-label="Send"
              className="rounded-full"
              disabled={!canSend}
              size="icon-sm"
              type="submit"
              variant="default"
            >
              <ArrowUpIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
