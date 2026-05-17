import { StripeReturnState } from "@/components/checkout/stripe-return-state";

export default function CheckoutCancelPage() {
  return <StripeReturnState mode="cancel" />;
}
