"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { DeliveryForm } from "@/components/checkout/delivery-form";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { PriceSummary } from "@/components/checkout/price-summary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AddressSelects,
  DeliveryMethodSelector,
  buildCartShippingFingerprint,
  buildShippingQuoteRequest,
  buildShippingQuoteSnapshot,
  createEmptyShippingAddress,
  fromDeliveryProfileInput,
  hasStructuredDeliveryAddress,
  isQuoteExpired,
  shouldInvalidateQuote,
  toDeliveryProfileInput,
  useShippingQuote,
  useShippingSelectors,
} from "@/features/shipping";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { TAX_RATE } from "@/lib/constants";
import { PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY } from "@/lib/payment";
import { createOrder } from "@/services/order-service";
import { createCheckoutSession, createVnpayPaymentUrl } from "@/services/payment-service";
import { getDeliveryProfile } from "@/services/user-service";
import { useCartStore } from "@/stores/cart-store";
import type { DeliveryInfo, DeliveryMethod, PaymentMethod } from "@/types";

const PHONE_REGEX = /^(0[35789]\d{8})$/;

type DeliveryErrors = Partial<Record<keyof DeliveryInfo, string>>;

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
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("GHN_DELIVERY");
  const [delivery, setDelivery] = useState<DeliveryInfo>(createEmptyShippingAddress());
  const [savedDelivery, setSavedDelivery] = useState<DeliveryInfo | null>(null);
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [notes, setNotes] = useState("");
  const [saveDeliveryProfile, setSaveDeliveryProfile] = useState(false);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCheckoutBlocked = Boolean(cartSyncError);

  const cartShippingFingerprint = useMemo(
    () => buildCartShippingFingerprint(items),
    [items]
  );
  const previousCartShippingFingerprint = useRef<string | null>(null);
  const previousPaymentMethod = useRef<PaymentMethod>("COD");

  const {
    provinces,
    districts,
    wards,
    loadingDistricts,
    loadingProvinces,
    loadingWards,
    error: shippingSelectorsError,
  } = useShippingSelectors(delivery.provinceId ?? null, delivery.districtId ?? null);
  const {
    quote,
    loading: isLoadingQuote,
    error: quoteError,
    quoteInvalidated,
    requestQuote,
    invalidateQuote,
    resetQuote,
  } = useShippingQuote();

  const shipping =
    deliveryMethod === "GHN_DELIVERY" ? quote?.feeBreakdown.totalFee ?? 0 : 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;
  const needsFreshQuote =
    deliveryMethod === "GHN_DELIVERY" &&
    (!quote || quoteInvalidated || isQuoteExpired(quote));

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
          const nextDelivery = fromDeliveryProfileInput(profile);
          setDelivery(nextDelivery);
          setSavedDelivery(nextDelivery);
          setSaveDeliveryProfile(false);
        } else {
          setSavedDelivery(null);
          setSaveDeliveryProfile(true);
        }
      } catch {
        if (!cancelled) {
          setSavedDelivery(null);
          setSaveDeliveryProfile(false);
          setDelivery(createEmptyShippingAddress());
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
  }, [authLoading]);

  // Set default province to Ho Chi Minh City
  useEffect(() => {
    if (provinces.length > 0 && !delivery.provinceId) {
      const hcmProvince = provinces.find(
        (p) =>
          p.provinceName.toLowerCase().includes("hồ chí minh") ||
          p.provinceName.toLowerCase().includes("ho chi minh")
      );

      if (hcmProvince) {
        setDelivery((prev) => ({
          ...prev,
          provinceId: hcmProvince.provinceId,
          provinceName: hcmProvince.provinceName,
        }));
      }
    }
  }, [provinces, delivery.provinceId]);

  useEffect(() => {
    if (
      previousCartShippingFingerprint.current &&
      previousCartShippingFingerprint.current !== cartShippingFingerprint &&
      deliveryMethod === "GHN_DELIVERY"
    ) {
      invalidateQuote();
    }

    previousCartShippingFingerprint.current = cartShippingFingerprint;
  }, [cartShippingFingerprint, deliveryMethod, invalidateQuote]);

  useEffect(() => {
    previousPaymentMethod.current = paymentMethod;
  }, [paymentMethod]);

  function clearFieldError(field: keyof DeliveryInfo) {
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  }

  function handleFieldChange(field: keyof DeliveryInfo, value: string) {
    setDelivery((previous) => {
      const next = { ...previous, [field]: value };
      if (
        deliveryMethod === "GHN_DELIVERY" &&
        shouldInvalidateQuote(previous, next)
      ) {
        invalidateQuote();
      }
      return next;
    });
    clearFieldError(field);
  }

  function handleProvinceChange(provinceId: number) {
    const province = provinces.find((item) => item.provinceId === provinceId);

    setDelivery((previous) => {
      const next: DeliveryInfo = {
        ...previous,
        provinceId,
        provinceName: province?.provinceName ?? null,
        districtId: null,
        districtName: null,
        wardCode: null,
        wardName: null,
      };

      if (deliveryMethod === "GHN_DELIVERY") {
        invalidateQuote();
      }

      return next;
    });
    setErrors((previous) => ({
      ...previous,
      provinceId: undefined,
      districtId: undefined,
      wardCode: undefined,
    }));
  }

  function handleDistrictChange(districtId: number) {
    const district = districts.find((item) => item.districtId === districtId);

    setDelivery((previous) => {
      const next: DeliveryInfo = {
        ...previous,
        districtId,
        districtName: district?.districtName ?? null,
        wardCode: null,
        wardName: null,
      };

      if (deliveryMethod === "GHN_DELIVERY") {
        invalidateQuote();
      }

      return next;
    });
    setErrors((previous) => ({
      ...previous,
      districtId: undefined,
      wardCode: undefined,
    }));
  }

  async function handleWardChange(wardCode: string) {
    const ward = wards.find((item) => item.wardCode === wardCode);
    const nextDelivery: DeliveryInfo = {
      ...delivery,
      wardCode,
      wardName: ward?.wardName ?? null,
    };

    setDelivery(nextDelivery);
    clearFieldError("wardCode");

    // Auto-fetch quote when ward changes for GHN delivery
    if (deliveryMethod === "GHN_DELIVERY" && hasStructuredDeliveryAddress(nextDelivery)) {
      await requestQuote(
        buildShippingQuoteRequest({
          deliveryMethod: "GHN_DELIVERY",
          paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "COD",
          delivery: nextDelivery,
        })
      );
    }
  }

  function validate(): boolean {
    const nextErrors: DeliveryErrors = {};

    if (!delivery.fullName.trim()) {
      nextErrors.fullName = t("errorRequired");
    }

    if (!delivery.phoneNumber.trim()) {
      nextErrors.phoneNumber = t("errorRequired");
    } else if (!PHONE_REGEX.test(delivery.phoneNumber.trim())) {
      nextErrors.phoneNumber = t("errorPhone");
    }

    if (deliveryMethod === "GHN_DELIVERY") {
      if (!delivery.address.trim()) {
        nextErrors.address = t("errorRequired");
      }

      if (!delivery.districtId) {
        nextErrors.districtId = t("errorRequired");
      }

      if (!delivery.wardCode) {
        nextErrors.wardCode = t("errorRequired");
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }


  async function handleSubmit() {
    if (isCheckoutBlocked) {
      toast.error(cartSyncError ?? t("errorOrderFailed"));
      return;
    }

    if (!validate()) {
      return;
    }

    if (deliveryMethod === "GHN_DELIVERY") {
      if (!quote || quoteInvalidated || isQuoteExpired(quote)) {
        toast.error(t("quoteRequired"));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const quoteSnapshot =
        deliveryMethod === "GHN_DELIVERY" && quote
          ? buildShippingQuoteSnapshot(quote)
          : null;

      const commonPayload = {
        fullName: delivery.fullName.trim(),
        phoneNumber: delivery.phoneNumber.trim(),
        address: delivery.address.trim(),
        provinceId: delivery.provinceId ?? null,
        provinceName: delivery.provinceName ?? null,
        districtId: delivery.districtId ?? null,
        districtName: delivery.districtName ?? null,
        wardCode: delivery.wardCode ?? null,
        wardName: delivery.wardName ?? null,
        notes: notes.trim() ? notes.trim() : null,
        saveDeliveryProfile:
          deliveryMethod === "GHN_DELIVERY" ? saveDeliveryProfile : false,
        deliveryMethod,
        shippingQuoteFingerprint: quoteSnapshot?.shippingQuoteFingerprint ?? null,
        shippingServiceId: quoteSnapshot?.shippingServiceId ?? null,
        shippingServiceTypeId: quoteSnapshot?.shippingServiceTypeId ?? null,
        shippingServiceLabel: quoteSnapshot?.shippingServiceLabel ?? null,
        shippingFee: quoteSnapshot?.shippingFee ?? null,
        shippingQuoteExpiresAt: quoteSnapshot?.shippingQuoteExpiresAt ?? null,
        shippingProviderEnvironment:
          quoteSnapshot?.shippingProviderEnvironment ?? null,
      } as const;

      if (paymentMethod === "STRIPE") {
        try {
          const session = await createCheckoutSession(commonPayload);
          sessionStorage.setItem(
            PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY,
            session.checkoutDraftId
          );
          window.location.assign(session.checkoutUrl);
          return;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : t("stripeRedirectFailed")
          );
          return;
        }
      }

      if (paymentMethod === "VNPAY") {
        try {
          const paymentResponse = await createVnpayPaymentUrl({
            deliveryProvinceName: delivery.provinceName ?? "",
            deliveryDistrictName: delivery.districtName ?? "",
            deliveryWardName: delivery.wardName ?? "",
            deliveryAddressDetail: delivery.address.trim(),
            deliveryPhoneNumber: delivery.phoneNumber.trim(),
            shippingProviderId: quoteSnapshot?.shippingServiceId ?? 1,
            expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            serviceId: quoteSnapshot?.shippingServiceId ?? 1,
          });

          sessionStorage.setItem(
            "morii.pendingHostedCheckout",
            JSON.stringify({
              provider: "Vnpay",
              checkoutDraftId: paymentResponse.checkoutDraftId,
              providerSessionId: paymentResponse.txnRef,
              expiresAtUtc: paymentResponse.expiresAtUtc,
            })
          );

          window.location.assign(paymentResponse.paymentUrl);
          return;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : t("errorPaymentUrlFailed")
          );
          return;
        }
      }

      const createdOrder = await createOrder({
        ...commonPayload,
        paymentMethod,
      });
      const orderId = createdOrder.orderId ?? createdOrder.id;
      if (!orderId) {
        throw new Error(t("errorOrderFailed"));
      }

      if (deliveryMethod === "GHN_DELIVERY" && saveDeliveryProfile) {
        setSavedDelivery(toDeliveryProfileInput(delivery));
      }

      await clearCart();
      router.push(`/orders/${orderId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("errorOrderFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeliveryMethodChange(nextMethod: DeliveryMethod) {
    setDeliveryMethod(nextMethod);
    setErrors({});
    resetQuote();
  }

  if (
    authLoading ||
    !isCartReady ||
    isLoadingDelivery ||
    loadingProvinces
  ) {
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
          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {cartSyncError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {cartSyncError}
              </p>
            ) : null}

            <DeliveryMethodSelector
              value={deliveryMethod}
              onChange={handleDeliveryMethodChange}
              disabled={isSubmitting}
            />

            {deliveryMethod === "GHN_DELIVERY" ? (
              <DeliveryForm
                values={delivery}
                errors={errors}
                onChange={handleFieldChange}
                disabled={isSubmitting}
              >
                <AddressSelects
                  provinceId={delivery.provinceId ?? null}
                  districtId={delivery.districtId ?? null}
                  wardCode={delivery.wardCode ?? null}
                  provinces={provinces}
                  districts={districts}
                  wards={wards}
                  disabled={isSubmitting}
                  disabledProvinceSelection
                  loadingDistricts={loadingDistricts}
                  loadingWards={loadingWards}
                  onProvinceChange={handleProvinceChange}
                  onDistrictChange={handleDistrictChange}
                  onWardChange={handleWardChange}
                />
                {shippingSelectorsError ? (
                  <p className="text-xs text-destructive">{shippingSelectorsError}</p>
                ) : null}
                {errors.districtId ? (
                  <p className="text-xs text-destructive">{errors.districtId}</p>
                ) : null}
                {errors.wardCode ? (
                  <p className="text-xs text-destructive">{errors.wardCode}</p>
                ) : null}
              </DeliveryForm>
            ) : null}

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

              {savedDelivery && deliveryMethod === "GHN_DELIVERY" ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setDelivery(savedDelivery);
                    resetQuote();
                  }}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
                >
                  {t("useSavedInfo")}
                </button>
              ) : null}

              {deliveryMethod === "GHN_DELIVERY" ? (
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
              ) : null}
            </div>

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              disabled={isSubmitting}
            />
          </div>

          <div className="h-fit lg:sticky lg:top-8">
            <PriceSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              shippingLabel={
                deliveryMethod === "PICKUP" ? t("pickupShippingFree") : undefined
              }
              discount={discount}
              total={total}
            >
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  isCheckoutBlocked ||
                  (deliveryMethod === "GHN_DELIVERY" && needsFreshQuote)
                }
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
