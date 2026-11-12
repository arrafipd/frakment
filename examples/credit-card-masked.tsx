import { FrakmentMark } from "@/components/site/brand";
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

export function CreditCardMasked() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer
            logo={<FrakmentMark className="size-5 sm:size-6" />}
          />
          <CreditCardBrand brand="visa" />
        </CreditCardHeader>
        <CreditCardNumber value="4242424242424242" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer
            logo={<FrakmentMark className="size-5 sm:size-6" />}
          />
          <CreditCardBrand brand="visa" />
        </CreditCardHeader>
        <CreditCardNumber masked value="4242424242424242" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
    </div>
  );
}
