"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, Coffee, ShoppingCart, Trash2 } from "lucide-react";
import { cn, formatVND } from "@/lib/utils";
import type { Product } from "@/data/products";
import { getAllProducts, resolveCartItemInput } from "@/services/products-service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toast } from "react-toastify";

const placeholderColors: Record<string, string> = {
  espresso: "from-amber-900/80 to-amber-800/60",
  "cold-brew": "from-sky-700/80 to-sky-600/60",
  latte: "from-orange-400/80 to-orange-300/60",
  pastry: "from-pink-400/80 to-pink-300/60",
  merchandise: "from-violet-500/80 to-violet-400/60",
};

export default function WishlistPage() {
  const t = useTranslations("product");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");

  const wishlistItems = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  useEffect(() => {
    getAllProducts().then(setAllProducts).catch(() => {});
  }, []);

  const wishlisted = allProducts.filter((p) => wishlistItems.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">
          {tProfile("myWishlist")}
        </h1>

        {wishlisted.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-muted-foreground">
              Browse our products and add your favorites to your wishlist.
            </p>
            <Link
              href="/products"
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlisted.map((product) => {
              if (!product) return null;
              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div
                      className={cn(
                        "flex h-48 items-center justify-center bg-gradient-to-br",
                        placeholderColors[product.categories[0]] ||
                          "from-muted to-muted/60"
                      )}
                    >
                      <Coffee className="h-12 w-12 text-white/60" />
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <span className="mt-2 block text-lg font-bold text-card-foreground">
                      {formatVND(product.price)}
                    </span>

                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={!product.inStock || addingProductId === product.id}
                        onClick={() => {
                          void (async () => {
                            setAddingProductId(product.id);

                            try {
                              const cartItem = await resolveCartItemInput(product);
                              await addItem(cartItem);
                              toast.success(`${product.name} — ${t("addToCart")}`);
                            } catch {
                              toast.error(tCommon("error"));
                            } finally {
                              setAddingProductId((current) =>
                                current === product.id ? null : current
                              );
                            }
                          })();
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t("addToCart")}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title={t("removeFromWishlist")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
