"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatVND } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ui/product-image";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { useCartStore } from "@/stores/cart-store";
import { resolveCartItemInput } from "@/services/products-service";
import { toast } from "react-toastify";
import type { Product } from "@/types";


interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock || isAdding) return;

    setIsAdding(true);

    try {
      const cartItem = await resolveCartItemInput(product);
      await addItem(cartItem);
      toast.success(`${product.name} — ${t("addToCart")}`);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
        {/* Product image */}
        <div className="relative h-48 md:h-54 lg:h-60 overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.categories[0]}
          />
          <WishlistButton
            product={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: product.image,
              inStock: product.inStock,
            }}
          />
          {!product.inStock && (
            <Badge
              variant="destructive"
              className="absolute right-3 top-3"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.categories.join(" · ")}
          </p>
          <h3 className="mb-2 text-base font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>

          {product.quantitySold > 0 && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShoppingBag className="h-3.5 w-3.5" />
              {product.quantitySold.toLocaleString()} {t("quantitySold")}
            </p>
          )}

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              {formatVND(product.price)}
            </span>
            <Button
              size="sm"
              variant={product.inStock ? "default" : "secondary"}
              disabled={!product.inStock || isAdding}
              onClick={(event) => {
                void handleAddToCart(event);
              }}
              className="gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
