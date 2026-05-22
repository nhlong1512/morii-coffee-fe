"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Search,
  Coffee,
  ShoppingCart,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { cn, formatCategory, formatVND } from "@/lib/utils";
import type { Product } from "@/data/products";
import { getAllProducts, resolveCartItemInput } from "@/services/products-service";
import { PRODUCT_CATEGORIES, CATEGORY_BADGE_COLORS } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "react-toastify";

type SortOption = "price-asc" | "price-desc" | "name";

export default function ProductsPage() {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  useEffect(() => {
    getAllProducts()
      .then(setAllProducts)
      .catch(() => {
        // Silently handle error - products will remain empty
      });
  }, []);

  const addItem = useCartStore((s) => s.addItem);

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
          p.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => p.categories.some((c) => selectedCategories.includes(c)));
    }

    if (minPrice) {
      result = result.filter((p) => p.price >= Number.parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number.parseFloat(maxPrice));
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
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategories, minPrice, maxPrice, inStockOnly, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("filterBy")} &mdash; {t("category")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("pageSubtitle")}</p>
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
              {t("filters")}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 appearance-none rounded-lg border border-border bg-input px-4 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="name">{t("sortByName")}</option>
                <option value="price-asc">{t("sortByPriceAsc")}</option>
                <option value="price-desc">{t("sortByPriceDesc")}</option>
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
                <h2 className="text-lg font-semibold text-foreground">
                  {t("filters")}
                </h2>
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
                    <span className="text-card-foreground">
                      {formatCategory(cat)}
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
                  {t("inStockOnly")}
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
                  {t("noResultsHint")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                          category={product.categories[0]}
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
                      {/* Category badges */}
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((cat) => (
                          <span
                            key={cat}
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                              CATEGORY_BADGE_COLORS[cat]
                            )}
                          >
                            {formatCategory(cat)}
                          </span>
                        ))}
                      </div>

                      {/* Name */}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="mt-2 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price and Actions */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-card-foreground">
                          {formatVND(product.price)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <WishlistButton
                            variant="inline"
                            size="sm"
                            product={{
                              productId: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              image: product.image,
                              inStock: product.inStock,
                            }}
                          />
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
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden sm:inline">Add</span>
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
