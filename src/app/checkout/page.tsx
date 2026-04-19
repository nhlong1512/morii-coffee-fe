"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { TAX_RATE, SHIPPING_FEE } from "@/lib/constants";
import { createOrder } from "@/services/order-service";
import { DeliveryForm } from "@/components/checkout/delivery-form";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { PriceSummary } from "@/components/checkout/price-summary";
import { toast } from "@/hooks/use-toast";
import type { DeliveryInfo, PaymentMethod } from "@/types";

const PHONE_REGEX = /^(0[35789]\d{8})$/;

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = totalPrice();
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = SHIPPING_FEE;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;

  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryInfo, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  function handleFieldChange(field: keyof DeliveryInfo, value: string) {
    setDelivery((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof DeliveryInfo, string>> = {};
    if (!delivery.fullName.trim()) next.fullName = t("errorRequired");
    if (!delivery.phoneNumber.trim()) {
      next.phoneNumber = t("errorRequired");
    } else if (!PHONE_REGEX.test(delivery.phoneNumber.trim())) {
      next.phoneNumber = t("errorPhone");
    }
    if (!delivery.address.trim()) next.address = t("errorRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size ?? "",
          image: item.image,
        })),
        delivery,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        discount,
        total,
      });

      clearCart();
      router.push("/orders");
    } catch {
      toast({
        title: t("errorOrderFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToCart")}
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-foreground">{t("title")}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            <DeliveryForm
              values={delivery}
              errors={errors}
              onChange={handleFieldChange}
            />
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Right: Summary + CTA */}
          <div className="lg:sticky lg:top-8 h-fit">
            <PriceSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              total={total}
            >
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("placing")}
                  </>
                ) : (
                  t("placeOrder")
                )}
              </button>
            </PriceSummary>
          </div>
        </div>
      </div>
    </div>
  );
}
