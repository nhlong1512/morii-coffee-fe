"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatVND } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ui/product-image";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/types";


interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("product");
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: product.sizes.length > 0 ? product.sizes[0] : undefined,
      image: product.image,
    });

    toast({
      title: product.name,
      description: t("addToCart"),
    });
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
          <h3 className="mb-1 text-base font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              {formatVND(product.price)}
            </span>
            <Button
              size="sm"
              variant={product.inStock ? "default" : "secondary"}
              disabled={!product.inStock}
              onClick={handleAddToCart}
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
