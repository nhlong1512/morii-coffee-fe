"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { products } from "@/data/products";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const t = useTranslations("home");

  // Show featured products if the field exists, otherwise take the first 8
  const featuredProducts = products
    .filter((p) => "featured" in p ? (p as { featured: boolean }).featured : true)
    .slice(0, 8);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-between">
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
