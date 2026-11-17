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

export function CreditCardDemo() {
  return (
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
  );
}
