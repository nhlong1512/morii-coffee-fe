"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { DeliveryForm } from "@/components/checkout/delivery-form";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { PriceSummary } from "@/components/checkout/price-summary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { SHIPPING_FEE, TAX_RATE } from "@/lib/constants";
import { createOrder } from "@/services/order-service";
import { getDeliveryProfile } from "@/services/user-service";
import { useCartStore } from "@/stores/cart-store";
import type { DeliveryInfo, PaymentMethod } from "@/types";

const PHONE_REGEX = /^(0[35789]\d{8})$/;

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { isLoading: authLoading } = useProtectedRoute();

  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const isCartReady = useCartStore((state) => state.isReady);
  const cartSyncError = useCartStore((state) => state.syncError);

  const subtotal = totalPrice();
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;

  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [savedDelivery, setSavedDelivery] = useState<DeliveryInfo | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryInfo, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [notes, setNotes] = useState("");
  const [saveDeliveryProfile, setSaveDeliveryProfile] = useState(false);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !isCartReady) {
      return;
    }

    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [authLoading, isCartReady, items.length, router]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadDeliveryProfile() {
      setIsLoadingDelivery(true);
      try {
        const profile = await getDeliveryProfile();
        if (cancelled) {
          return;
        }

        if (profile) {
          setDelivery(profile);
          setSavedDelivery(profile);
          setSaveDeliveryProfile(false);
        } else {
          setSavedDelivery(null);
          setSaveDeliveryProfile(true);
        }
      } catch {
        if (!cancelled) {
          // Allow checkout to continue even if the optional delivery-profile
          // endpoint is temporarily unavailable on the backend.
          setSavedDelivery(null);
          setSaveDeliveryProfile(false);
          setDelivery({
            fullName: "",
            phoneNumber: "",
            address: "",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDelivery(false);
        }
      }
    }

    void loadDeliveryProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, t]);

  function handleFieldChange(field: keyof DeliveryInfo, value: string) {
    setDelivery((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof DeliveryInfo, string>> = {};

    if (!delivery.fullName.trim()) {
      nextErrors.fullName = t("errorRequired");
    }

    if (!delivery.phoneNumber.trim()) {
      nextErrors.phoneNumber = t("errorRequired");
    } else if (!PHONE_REGEX.test(delivery.phoneNumber.trim())) {
      nextErrors.phoneNumber = t("errorPhone");
    }

    if (!delivery.address.trim()) {
      nextErrors.address = t("errorRequired");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        fullName: delivery.fullName.trim(),
        phoneNumber: delivery.phoneNumber.trim(),
        address: delivery.address.trim(),
        paymentMethod,
        notes: notes.trim() ? notes.trim() : null,
        saveDeliveryProfile,
      });

      await clearCart();
      router.push("/orders");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("errorOrderFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !isCartReady || isLoadingDelivery) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToCart")}
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-foreground">{t("title")}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {cartSyncError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {cartSyncError}
              </p>
            ) : null}

            <DeliveryForm
              values={delivery}
              errors={errors}
              onChange={handleFieldChange}
              disabled={isSubmitting}
            />

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div className="space-y-2">
                <label
                  htmlFor="order-notes"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("notes")}
                </label>
                <textarea
                  id="order-notes"
                  rows={4}
                  value={notes}
                  disabled={isSubmitting}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("notesPlaceholder")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              {savedDelivery ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setDelivery(savedDelivery)}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
                >
                  {t("useSavedInfo")}
                </button>
              ) : null}

              <label className="flex items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={saveDeliveryProfile}
                  disabled={isSubmitting}
                  onChange={(event) => setSaveDeliveryProfile(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span>{t("saveDeliveryInfo")}</span>
              </label>
            </div>

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          <div className="h-fit lg:sticky lg:top-8">
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
