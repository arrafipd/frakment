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
        <CreditCardIssuer />
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
