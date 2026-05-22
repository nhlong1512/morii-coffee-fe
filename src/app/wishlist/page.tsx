"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, ShoppingCart, ShoppingBag } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { resolveCartItemInput } from "@/services/products-service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { ProductImage } from "@/components/ui/product-image";
import { toast } from "react-toastify";

export default function WishlistPage() {
  const t = useTranslations("product");
  const tWishlist = useTranslations("wishlist");
  const tCommon = useTranslations("common");

  const wishlistItems = useWishlistStore((s) => s.items);
  const addCartItem = useCartStore((s) => s.addItem);

  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, name: string, price: number, image: string) => {
    if (addingProductId === productId) return;
    setAddingProductId(productId);
    try {
      const cartItem = await resolveCartItemInput({ id: productId, name, price, image });
      await addCartItem(cartItem);
      toast.success(`${name} — ${t("addToCart")}`);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setAddingProductId((current) => (current === productId ? null : current));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">
          {tWishlist("title")}
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              {tWishlist("empty")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {tWishlist("emptyDescription")}
            </p>
            <Link
              href="/products"
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {tWishlist("browseProducts")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <div
                key={item.productId}
                className="group overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative h-48 overflow-hidden">
                  <Link href={`/products/${item.slug}`}>
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      category=""
                    />
                  </Link>
                  <WishlistButton
                    product={{
                      productId: item.productId,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      image: item.image,
                      inStock: item.inStock,
                    }}
                  />
                  {!item.inStock && (
                    <span className="absolute left-2 top-2 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                      {tWishlist("outOfStock")}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="text-base font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>

                  {item.quantitySold > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {item.quantitySold.toLocaleString()} đã bán
                    </p>
                  )}

                  <span className="mt-2 block text-lg font-bold text-card-foreground">
                    {formatVND(item.price)}
                  </span>

                  <div className="mt-4">
                    <button
                      disabled={!item.inStock || addingProductId === item.productId}
                      onClick={() => {
                        void handleAddToCart(item.productId, item.name, item.price, item.image);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {t("addToCart")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
