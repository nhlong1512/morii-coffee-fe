"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { getProducts } from "@/services/products-service";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const t = useTranslations("home");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ isFeatured: true, size: 8 })
      .then((r) => setFeaturedProducts(r.products))
      .catch(() => {/* silently fall back to empty list */});
  }, []);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("featuredProducts")}
          </h2>
          <Button asChild variant="ghost" className="gap-1 text-muted-foreground">
            <Link href="/products">
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
