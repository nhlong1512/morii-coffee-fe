"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Coffee,
  Heart,
  ShoppingCart,
  ShoppingBag,
  ChevronLeft,
  Minus,
  Plus,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { cn, formatVND } from "@/lib/utils";
import { CATEGORY_BADGE_COLORS } from "@/lib/constants";
import { getProductBySlug } from "@/services/products-service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toast } from "react-toastify";
import { ProductStatus } from "@/enums";
import type { ApiProductDetail, ApiProductVariant } from "@/types/api";

export default function ProductDetailPage() {
  const t = useTranslations("product");
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ApiProductDetail | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  useEffect(() => {
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        const defaultVariant = p?.variants.find(v => v.isDefault) || p?.variants[0];
        setSelectedVariant(defaultVariant);
      })
      .catch(() => setProduct(undefined))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <Coffee className="h-12 w-12 animate-pulse text-muted-foreground/40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4">
        <Coffee className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <Link href="/products" className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const galleryImages = product.images?.length > 0 ? product.images.sort((a, b) => a.displayOrder - b.displayOrder).map((img) => img.url) : [];

  const currentPrice = selectedVariant ? selectedVariant.totalPrice : product.basePrice;
  const isOutOfStock =
    product.status === ProductStatus.Inactive ||
    (selectedVariant !== undefined && !selectedVariant.isAvailable);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity,
      variantId: selectedVariant.id,
      size: selectedVariant.size,
      image: product.thumbnailUrl || galleryImages[0],
    });
    toast.success(`${product.name} — ${t("addToCart")}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              {galleryImages.length > 0 ? (
                <ProductImage
                  src={galleryImages[selectedImage]}
                  alt={product.name}
                  category={product.categories[0]?.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Coffee className="h-20 w-20 text-muted-foreground/20" />
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((url, idx) => (
                  <button
                    key={url+idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      selectedImage === idx ? "border-primary" : "border-transparent opacity-60"
                    )}
                  >
                    <ProductImage src={url} alt={product.name} category={product.categories[0]?.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-1.5">
              {product.categories.map((cat) => (
                <span key={cat.id} className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", CATEGORY_BADGE_COLORS[cat.name.toLowerCase()] || "bg-secondary text-secondary-foreground")}>
                  {cat.name}
                </span>
              ))}
            </div>

            <h1 className="mt-3 text-3xl font-bold text-foreground">{product.name}</h1>
            {product.quantitySold > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                {product.quantitySold.toLocaleString()} {t("product.quantitySold")}
              </p>
            )}

            <div className="mt-3">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> {t("outOfStock")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" /> {t("inStock")}
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">{formatVND(currentPrice)}</span>
            </div>

            {/* Size Selector - Mapping from variants array */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">{t("selectSize")}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      disabled={!variant.isAvailable}
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "flex h-10 min-w-12 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-40",
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent"
                      )}
                    >
                      {variant.name || variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Quantity</h3>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center hover:bg-accent rounded-l-lg"><Minus className="h-4 w-4" /></button>
                <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center hover:bg-accent rounded-r-lg"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" /> {t("addToCart")}
              </button>
              <button
                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border font-semibold hover:bg-accent"
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-red-500 text-red-500")} />
                {inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
              </button>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground">{t("description")}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{product.description || "No description available."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
