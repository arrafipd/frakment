"use client";

import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function InputOTPInvalid() {
  const [value, setValue] = React.useState("000000");
  return (
    <InputOTP maxLength={6} onChange={setValue} value={value}>
      <InputOTPGroup>
        <InputOTPSlot aria-invalid index={0} />
        <InputOTPSlot aria-invalid index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot aria-invalid index={2} />
        <InputOTPSlot aria-invalid index={3} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot aria-invalid index={4} />
        <InputOTPSlot aria-invalid index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
