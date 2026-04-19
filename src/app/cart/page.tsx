"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { TAX_RATE, SHIPPING_FEE } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const t = useTranslations("cart");

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice);

  const subtotal = totalPrice();
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const discount = 0;
  const total = subtotal + tax + shipping - discount;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">{t("yourCart")}</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t("clearCart")}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              {t("empty")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("emptyHint")}</p>
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
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-semibold text-card-foreground truncate">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {t("size")}: {item.size}
                          </p>
                        )}
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatVND(item.price)} {t("each")}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        {/* Quantity Controls */}
                        <div className="inline-flex items-center rounded-lg border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.size)
                            }
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-lg"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-8 w-10 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.size)
                            }
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-lg"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Line total and remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-card-foreground">
                            {formatVND(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            title={t("remove")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-8 rounded-xl border border-border bg-card p-6 space-y-4">
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
