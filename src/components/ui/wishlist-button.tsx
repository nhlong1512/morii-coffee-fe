"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { WishlistItem } from "@/stores/wishlist-store";

interface WishlistButtonProps {
  product: {
    productId: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    inStock: boolean;
  };
  size?: "sm" | "md";
  variant?: "overlay" | "inline";
  className?: string;
}

export function WishlistButton({
  product,
  size = "sm",
  variant = "overlay",
  className,
}: WishlistButtonProps) {
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const pendingIds = useWishlistStore((state) => state.pendingIds);

  const wishlisted = isInWishlist(product.productId);
  const isPending = pendingIds.has(product.productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    if (wishlisted) {
      void removeItem(product.productId);
    } else {
      const item: WishlistItem = {
        productId: product.productId,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        inStock: product.inStock,
        addedAt: new Date().toISOString(),
      };
      void addItem(item);
    }
  };

  const overlayClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const inlineClasses = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const heartIconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "overlay" && [
          "absolute right-2 top-2 z-10",
          overlayClasses,
          "bg-background/80 shadow backdrop-blur-sm hover:bg-background",
        ],
        variant === "inline" && [
          "border border-border bg-card hover:bg-accent",
          inlineClasses,
        ],
        className
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-150 active:scale-125",
          heartIconSize,
          wishlisted
            ? "fill-red-500 stroke-red-500"
            : "fill-transparent stroke-foreground"
        )}
      />
    </button>
  );
}
