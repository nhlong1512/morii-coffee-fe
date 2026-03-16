"use client";

import React from "react";
import Link from "next/link";
import { Coffee, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";

const categoryColors: Record<string, string> = {
  espresso: "bg-amber-800",
  "cold-brew": "bg-sky-800",
  latte: "bg-amber-600",
  pastry: "bg-orange-700",
  merchandise: "bg-stone-700",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
        {/* Image Placeholder */}
        <div
          className={cn(
            "relative flex h-48 items-center justify-center",
            categoryColors[product.category] || "bg-stone-700"
          )}
        >
          <Coffee className="h-16 w-16 text-white/40" />
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
            {product.category}
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
              ${product.price.toFixed(2)}
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
