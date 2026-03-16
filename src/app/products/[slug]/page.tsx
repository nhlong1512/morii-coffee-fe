"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Coffee,
  Star,
  StarHalf,
  Heart,
  ShoppingCart,
  ChevronLeft,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { products } from "@/data/products";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ReviewSummary } from "@/components/reviews/review-summary";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400" />
      )}
      {Array.from({ length: 5 - full - (hasHalf ? 1 : 0) }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground/40" />
      ))}
    </div>
  );
}

const categoryColors: Record<string, string> = {
  espresso: "bg-amber-900/10 text-amber-900 dark:bg-amber-400/10 dark:text-amber-400",
  "cold-brew": "bg-sky-600/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
  latte: "bg-orange-500/10 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400",
  pastry: "bg-pink-500/10 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400",
  merchandise: "bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-400",
};

const placeholderShades = [
  "from-primary/70 to-primary/40",
  "from-primary/60 to-accent/50",
  "from-accent/70 to-primary/30",
  "from-muted to-primary/20",
];

export default function ProductDetailPage() {
  const t = useTranslations("product");
  const params = useParams();
  const slug = params.slug as string;
  const product = products.find((p) => p.slug === slug);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4">
        <Coffee className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you are looking for does not exist.
        </p>
        <Link
          href="/products"
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  // Simulate image gallery with placeholder shades
  const galleryImages = [0, 1, 2, 3];

  const basePrice = product.price;
  // Sizes in this data are just strings like "S", "M", "L" - no priceModifier
  // We'll simulate modifiers
  const sizeModifiers: Record<string, number> = {
    S: 0,
    M: 0.5,
    L: 1.0,
    XL: 1.5,
  };
  const currentPrice = basePrice + (selectedSize ? (sizeModifiers[selectedSize] || 0) : 0);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: currentPrice,
        size: selectedSize,
        image: product.image,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <div>
            {/* Main Image */}
            <div
              className={cn(
                "flex h-80 items-center justify-center rounded-xl bg-gradient-to-br sm:h-96 lg:h-[480px]",
                placeholderShades[selectedImage % placeholderShades.length]
              )}
            >
              <Coffee className="h-20 w-20 text-white/50" />
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-3">
              {galleryImages.map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br transition-all",
                    placeholderShades[idx % placeholderShades.length],
                    selectedImage === idx
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-60 hover:opacity-80"
                  )}
                >
                  <Coffee className="h-6 w-6 text-white/50" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span
              className={cn(
                "inline-block w-fit rounded-full px-3 py-1 text-xs font-medium capitalize",
                categoryColors[product.category]
              )}
            >
              {product.category.replace("-", " ")}
            </span>

            {/* Name */}
            <h1 className="mt-3 text-3xl font-bold text-foreground">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} {t("reviews")})
              </span>
            </div>

            {/* Availability */}
            <div className="mt-3">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {t("inStock")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {t("outOfStock")}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">
                ${currentPrice.toFixed(2)}
              </span>
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {t("selectSize")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "flex h-10 min-w-[3rem] items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-card-foreground hover:bg-accent"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Quantity
              </h3>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-lg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                {t("addToCart")}
              </button>
              <button
                onClick={() =>
                  inWishlist
                    ? removeFromWishlist(product.id)
                    : addToWishlist(product.id)
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border text-base font-semibold text-foreground hover:bg-accent transition-colors"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    inWishlist && "fill-red-500 text-red-500"
                  )}
                />
                {inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
              </button>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground">
                {t("description")}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 space-y-6">
          <ReviewSummary productId={product.id} />
          <ReviewForm productId={product.id} />
          <ReviewList productId={product.id} />
        </section>
      </div>
    </div>
  );
}
