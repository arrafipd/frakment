import { FrakmentMark } from "@/components/brand";
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

export function CreditCardVariants() {
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
      <CreditCard variant="glass">
        <CreditCardHeader>
          <CreditCardIssuer
            logo={<FrakmentMark className="size-5 sm:size-6" />}
          />
          <CreditCardBrand brand="mastercard" />
        </CreditCardHeader>
        <CreditCardNumber value="5555555555554444" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
    </div>
  );
}
