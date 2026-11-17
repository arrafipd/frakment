"use client";

import * as React from "react";

import { Tabs } from "@/components/ui/tabs";
import { useConfig } from "@/hooks/use-config";

const INSTALLATION_VALUES = new Set(["cli", "manual"]);

const extractValue = (tab: HTMLElement): string | null =>
  tab.id.match(/trigger-(.+)$/u)?.[1] ?? null;

export function CodeTabs({
  children,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  const [config, setConfig] = useConfig();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [activeValue, setActiveValue] = React.useState<string | undefined>();

  const configValue = config.installationType;

  React.useEffect(() => {
    if (activeValue !== undefined) {
      return;
    }
    const container = wrapperRef.current;
    if (!container) {
      return;
    }
    const tabs = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
    if (tabs.length === 0) {
      return;
    }
    const values = tabs
      .map(extractValue)
      .filter((v): v is string => v !== null);
    if (values.length === 0) {
      return;
    }
    const resolved =
      configValue && values.includes(configValue) ? configValue : values[0];
    setActiveValue(resolved);
  }, [activeValue, configValue]);

  React.useEffect(() => {
    if (!(configValue && INSTALLATION_VALUES.has(configValue))) {
      return;
    }
    if (activeValue === configValue) {
      return;
    }
    const container = wrapperRef.current;
    if (!container) {
      return;
    }
    const tabs = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
    const values = tabs
      .map(extractValue)
      .filter((v): v is string => v !== null);
    if (!values.includes(configValue)) {
      return;
    }
    setActiveValue(configValue);
  }, [configValue, activeValue]);

  const handleValueChange = (value: string) => {
    setActiveValue(value);
    if (INSTALLATION_VALUES.has(value)) {
      setConfig({ ...config, installationType: value as "cli" | "manual" });
    }
  };

  return (
    <div ref={wrapperRef}>
      <Tabs
        {...(activeValue === undefined
          ? {}
          : { onValueChange: handleValueChange, value: activeValue })}
        className="relative mt-6 w-full"
        {...props}
      >
        {children}
      </Tabs>
    </div>
  );
}
