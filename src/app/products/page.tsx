"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Search,
  Coffee,
  Star,
  StarHalf,
  Heart,
  ShoppingCart,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";
import { getAllProducts } from "@/services/products-service";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

type SortOption = "price-asc" | "price-desc" | "rating" | "name";

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <StarHalf className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      )}
      {Array.from({ length: 5 - full - (hasHalf ? 1 : 0) }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-muted-foreground/40" />
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


export default function ProductsPage() {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllProducts().then(setAllProducts).catch(() => {});
  }, []);

  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }

    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [searchQuery, selectedCategories, minPrice, maxPrice, inStockOnly, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("filterBy")} &mdash; {t("category")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of artisan coffees, pastries, and merchandise.
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchProducts")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 appearance-none rounded-lg border border-border bg-input px-4 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              "w-64 shrink-0 space-y-6",
              showFilters
                ? "fixed inset-0 z-50 overflow-y-auto bg-background p-6 lg:static lg:z-auto lg:p-0"
                : "hidden lg:block"
            )}
          >
            {showFilters && (
              <div className="flex items-center justify-between lg:hidden">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>
            )}

            {/* Category Filter */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                {t("category")}
              </h3>
              <div className="space-y-2">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 rounded border-border text-primary accent-primary"
                    />
                    <span className="capitalize text-card-foreground">
                      {cat.replace("-", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                {t("priceRange")}
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="rounded-xl border border-border bg-card p-4">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm font-semibold text-card-foreground">
                  {t("inStock")} only
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inStockOnly}
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    inStockOnly ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      inStockOnly ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Coffee className="mb-4 h-16 w-16 text-muted-foreground/40" />
                <h2 className="text-xl font-semibold text-foreground">
                  {tCommon("noResults")}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                  >
                    {/* Product image */}
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          category={product.category}
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                              {t("outOfStock")}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      {/* Category badge */}
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          categoryColors[product.category]
                        )}
                      >
                        {product.category.replace("-", " ")}
                      </span>

                      {/* Name */}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="mt-2 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <RatingStars rating={product.rating} />
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Price and Actions */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-card-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (isInWishlist(product.id)) {
                                removeFromWishlist(product.id);
                              } else {
                                addToWishlist(product.id);
                              }
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            title={
                              isInWishlist(product.id)
                                ? t("removeFromWishlist")
                                : t("addToWishlist")
                            }
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4",
                                isInWishlist(product.id) &&
                                  "fill-red-500 text-red-500"
                              )}
                            />
                          </button>
                          <button
                            disabled={!product.inStock}
                            onClick={() =>
                              addItem({
                                productId: product.id,
                                name: product.name,
                                price: product.price,
                                size:
                                  product.sizes.length > 0
                                    ? product.sizes[0]
                                    : undefined,
                                image: product.image,
                              })
                            }
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden sm:inline">{t("addToCart")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
