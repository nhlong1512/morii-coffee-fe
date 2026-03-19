import type { ProductSize } from "@/lib/constants";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  /** totalPrice per available size, derived from ApiProductVariant.totalPrice */
  variantPrices: Partial<Record<ProductSize, number>>;
  categories: string[];
  image: string;
  images: string[];
  sizes: ProductSize[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
}
