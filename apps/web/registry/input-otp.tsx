"use client";

import { MinusIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const digits = "^\\d+$";
const chars = "^[a-zA-Z]+$";
const alphanumeric = "^[a-zA-Z0-9]+$";

interface SlotProps {
  char: string | null;
  hasFakeCaret: boolean;
  isActive: boolean;
  placeholderChar: string | null;
}

interface RenderProps {
  isFocused: boolean;
  isHovering: boolean;
  slots: SlotProps[];
}

const OTPInputContext = React.createContext<RenderProps>({
  isFocused: false,
  isHovering: false,
  slots: [],
});

type OTPInputBaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "maxLength" | "pattern" | "placeholder"
> & {
  containerClassName?: string;
  maxLength: number;
  onChange?: (value: string) => void;
  pattern?: string;
  placeholder?: string;
  value?: string;
};

type OTPInputProps = OTPInputBaseProps & {
  children?: React.ReactNode;
};

const InputOTP = React.forwardRef<HTMLInputElement, OTPInputProps>(
  function InputOTP(
    {
      children,
      className,
      containerClassName,
      defaultValue,
      disabled,
      id,
      inputMode = "numeric",
      maxLength,
      onChange,
      onFocus,
      onBlur,
      pattern,
      placeholder,
      value: valueProp,
      ...props
    },
    forwardedRef
  ) {
    const isControlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState<string>(
      typeof defaultValue === "string" ? defaultValue : ""
    );
    const value = isControlled ? valueProp : uncontrolled;
    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovering, setIsHovering] = React.useState(false);
    const [selectionStart, setSelectionStart] = React.useState(0);
    const [selectionEnd, setSelectionEnd] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLInputElement | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    const filterValue = React.useCallback(
      (raw: string): string => {
        let next = raw.slice(0, maxLength);
        if (pattern) {
          const re = new RegExp(pattern);
          if (!re.test(next)) {
            next = next
              .split("")
              .filter((c) => new RegExp(pattern.replace(/[+*]$/, "")).test(c))
              .join("");
          }
        }
        return next;
      },
      [maxLength, pattern]
    );

    const commit = React.useCallback(
      (next: string) => {
        const filtered = filterValue(next);
        if (!isControlled) {
          setUncontrolled(filtered);
        }
        onChange?.(filtered);
      },
      [filterValue, isControlled, onChange]
    );

    const updateSelection = React.useCallback(() => {
      const el = inputRef.current;
      if (!el) {
        return;
      }
      setSelectionStart(el.selectionStart ?? 0);
      setSelectionEnd(el.selectionEnd ?? 0);
    }, []);

    const slots = React.useMemo<SlotProps[]>(
      () =>
        Array.from({ length: maxLength }).map((_, i) => {
          const char = value[i] ?? null;
          const active =
            isFocused &&
            ((selectionStart === selectionEnd && i === selectionStart) ||
              (i >= selectionStart && i < selectionEnd));
          return {
            char,
            hasFakeCaret: active && char === null,
            isActive: active,
            placeholderChar: null,
          };
        }),
      [value, maxLength, isFocused, selectionStart, selectionEnd]
    );

    const contextValue = React.useMemo<RenderProps>(
      () => ({ isFocused, isHovering, slots }),
      [isFocused, isHovering, slots]
    );

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      commit(event.currentTarget.value);
      updateSelection();
    };

    const handleSelect = () => updateSelection();

    const handleClick = () => {
      inputRef.current?.focus();
      updateSelection();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      requestAnimationFrame(updateSelection);
    };

    return (
      <OTPInputContext.Provider value={contextValue}>
        <div
          className={cn("cn-input-otp flex items-center", containerClassName)}
          data-slot="input-otp"
          onClick={handleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <input
            aria-label={props["aria-label"] ?? "One-time password"}
            autoComplete="one-time-code"
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 opacity-0",
              className
            )}
            data-input-otp=""
            defaultValue={
              isControlled ? undefined : (defaultValue as string | undefined)
            }
            disabled={disabled}
            id={id}
            inputMode={inputMode}
            maxLength={maxLength}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            onChange={handleInput}
            onFocus={(e) => {
              setIsFocused(true);
              updateSelection();
              onFocus?.(e);
            }}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            pattern={pattern}
            placeholder={placeholder}
            ref={setRef}
            value={isControlled ? value : undefined}
            {...props}
          />
          {children}
        </div>
      </OTPInputContext.Provider>
    );
  }
);

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 flex items-center rounded-lg has-aria-invalid:ring-3",
        className
      )}
      data-slot="input-otp-group"
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] ?? {};

  return (
    <div
      className={cn(
        "border-input aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 relative flex size-8 items-center justify-center border-y border-r text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:ring-3",
        className
      )}
      data-active={isActive}
      data-slot="input-otp-slot"
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      data-slot="input-otp-separator"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export {
  alphanumeric,
  chars,
  digits,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
};
