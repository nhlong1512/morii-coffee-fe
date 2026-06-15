import { Suspense } from "react";
import { VnpayReturnState } from "@/components/checkout/vnpay-return-state";

export const metadata = {
  title: "Payment Verification | Morii Coffee",
  description: "Verifying your VNPAY payment...",
};

export default function VnpayReturnPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-2xl font-bold text-foreground">
          Payment Verification
        </h1>
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
          <VnpayReturnState />
        </Suspense>
      </div>
    </div>
  );
}
