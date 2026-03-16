import { HeroCarousel } from "@/components/home/hero-carousel";
import { FeaturedProducts } from "@/components/home/featured-products";
import { LoyaltyTeaser } from "@/components/home/loyalty-teaser";
import { BlogPreview } from "@/components/home/blog-preview";
import { StoreLocatorPreview } from "@/components/home/store-locator-preview";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroCarousel />
      <FeaturedProducts />
      <LoyaltyTeaser />
      <BlogPreview />
      <StoreLocatorPreview />
    </main>
  );
}
