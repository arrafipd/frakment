"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CreditCardBrand,
  CreditCardExpiry,
  CreditCardFooter,
  CreditCardHeader,
  CreditCardHolder,
  CreditCardIssuer,
  CreditCardNumber,
} from "@/components/ui/credit-card";
import { ArrowClockwiseIcon } from "@/lib/icons";

export function CreditCardMaskedMotion() {
  const [masked, setMasked] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMasked(true), 1300);
    return () => clearTimeout(t);
  }, [cycle]);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer />
          <CreditCardBrand brand="visa" />
        </CreditCardHeader>
        <CreditCardNumber masked={masked} value="4242424242424242" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
      <Button
        onClick={() => {
          setMasked(false);
          setCycle((c) => c + 1);
        }}
        size="sm"
        variant="outline"
      >
        <ArrowClockwiseIcon />
        Replay
      </Button>
    </div>
  );
}
