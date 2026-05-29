"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { formatProductSize, formatVND } from "@/lib/utils";
import { TAX_RATE, SHIPPING_FEE } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getProductDetail } from "@/services/products-service";
import { mapProductVariantToCartItem } from "@/services/cart-service";
import { toast } from "react-toastify";
import type { ApiProductVariant } from "@/types/api";

type ProductVariantsMap = Record<string, ApiProductVariant[]>;

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const changeVariant = useCartStore((s) => s.changeVariant);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const isReady = useCartStore((state) => state.isReady);
  const syncError = useCartStore((state) => state.syncError);
  const [variantsByProductId, setVariantsByProductId] = useState<ProductVariantsMap>({});
  const [changingItemKey, setChangingItemKey] = useState<string | null>(null);

  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.productId))),
    [items]
  );
  const productIdsKey = useMemo(
    () => productIds.slice().sort().join("|"),
    [productIds]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadVariants() {
      const ids = productIdsKey ? productIdsKey.split("|") : [];

      if (ids.length === 0) {
        if (isMounted) {
          setVariantsByProductId({});
        }
        return;
      }

      const entries = await Promise.all(
        ids.map(async (productId) => {
          try {
            const product = await getProductDetail(productId);
            return [productId, product.variants.filter((variant) => variant.isAvailable)] as const;
          } catch {
            return [productId, []] as const;
          }
        })
      );

      if (isMounted) {
        setVariantsByProductId(Object.fromEntries(entries));
      }
    }

    void loadVariants();

    return () => {
      isMounted = false;
    };
  }, [productIdsKey]);

  const subtotal = totalPrice();
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;

  if (isAuthenticated && !isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("yourCart")}</h1>
          {items.length > 0 && (
            <button
              onClick={() => {
                void clearCart();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {t("clearCart")}
            </button>
          )}
        </div>

        {syncError ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {syncError}
          </p>
        ) : null}

        {items.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              {t("empty")}
            </h2>
            <p className="mt-2 max-w-xs text-muted-foreground sm:max-w-sm">
              {t("emptyHint")}
            </p>
            <Link
              href="/products"
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("browseProducts")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => {
                  const itemKey =
                    item.cartItemId ?? `${item.productId}-${item.variantId ?? "base"}-${item.size}`;
                  const variants = variantsByProductId[item.productId] ?? [];
                  const hasVariantOptions = variants.length > 0;
                  const selectedVariantValue =
                    item.variantId ??
                    variants.find(
                      (variant) =>
                        formatProductSize(variant.size, locale) === formatProductSize(item.size, locale)
                    )?.id;

                  return (
                  <div
                    key={itemKey}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 w-full overflow-hidden rounded-lg bg-muted sm:w-24 sm:shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 96px"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground truncate">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {t("size")}: {formatProductSize(item.size, locale)}
                          </p>
                        )}
                        {hasVariantOptions ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {variants.map((variant) => {
                              const variantLabel = formatProductSize(variant.size, locale);
                              const isSelected = selectedVariantValue === variant.id;

                              return (
                                <Button
                                  key={variant.id}
                                  type="button"
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  disabled={changingItemKey === itemKey}
                                  className="min-w-16"
                                  onClick={() => {
                                    if (isSelected) {
                                      return;
                                    }

                                    setChangingItemKey(itemKey);
                                    void (async () => {
                                      try {
                                        await changeVariant(
                                          item,
                                          mapProductVariantToCartItem(item, variant)
                                        );
                                        toast.success(`${item.name} — ${t("sizeUpdated")}`);
                                      } catch {
                                        toast.error(t("sizeUpdateFailed"));
                                      } finally {
                                        setChangingItemKey((current) =>
                                          current === itemKey ? null : current
                                        );
                                      }
                                    })();
                                  }}
                                >
                                  {variantLabel}
                                </Button>
                              );
                            })}
                          </div>
                        ) : null}
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatVND(item.price)} {t("each")}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        {/* Quantity Controls */}
                        <div className="inline-flex items-center rounded-lg border border-border">
                          <button
                            onClick={() => {
                              void updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.size,
                                item.variantId,
                                item.cartItemId
                              );
                              if (item.quantity === 1) {
                                toast.error(`${item.name} — ${t("removed")}`);
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-lg"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-8 w-10 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              void updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.size,
                                item.variantId,
                                item.cartItemId
                              );
                            }}
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-lg"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Line total and remove */}
                        <div className="flex items-center justify-between gap-3 sm:justify-start">
                          <span className="text-base font-bold text-card-foreground">
                            {formatVND(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => {
                              void removeItem(
                                item.productId,
                                item.size,
                                item.variantId,
                                item.cartItemId
                              );
                              toast.error(`${item.name} — ${t("removed")}`);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            title={t("remove")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="space-y-4 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-8">
                <h2 className="text-lg font-semibold text-card-foreground">
                  {t("orderSummary")}
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("subtotal")}</span>
                    <span className="font-medium">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("tax")}</span>
                    <span className="font-medium">{formatVND(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("shipping")}</span>
                    <span className="font-medium">{formatVND(shipping)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>{t("discount")}</span>
                      <span>-{formatVND(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>{t("total")}</span>
                  <span className="text-primary">{formatVND(total)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t("checkout")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
