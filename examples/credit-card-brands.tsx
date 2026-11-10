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

export function CreditCardBrands() {
  return (
    <div className="grid gap-4">
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer />
          <CreditCardBrand brand="visa" />
        </CreditCardHeader>
        <CreditCardNumber brand="visa" value="4242424242424242" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer />
          <CreditCardBrand brand="mastercard" />
        </CreditCardHeader>
        <CreditCardNumber brand="mastercard" value="5555555555554444" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer />
          <CreditCardBrand brand="amex" />
        </CreditCardHeader>
        <CreditCardNumber brand="amex" value="378282246310005" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
      <CreditCard>
        <CreditCardHeader>
          <CreditCardIssuer />
          <CreditCardBrand brand="discover" />
        </CreditCardHeader>
        <CreditCardNumber brand="discover" value="6011111111111117" />
        <CreditCardFooter>
          <CreditCardHolder value="John Doe" />
          <CreditCardExpiry value="1228" />
        </CreditCardFooter>
      </CreditCard>
    </div>
  );
}
