import type { ProductCategory, ProductSize } from "@/lib/constants";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  images: string[];
  sizes: ProductSize[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "prod-001",
    name: "Classic Espresso",
    slug: "classic-espresso",
    description:
      "A rich, full-bodied espresso made from our signature blend of single-origin Arabica beans. Bold, smooth, and perfectly balanced with notes of dark chocolate and caramel.",
    price: 3.5,
    category: "espresso",
    image: "/images/products/classic-espresso.jpg",
    images: ["/images/products/classic-espresso.jpg"],
    sizes: ["S", "M"],
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
  featured: true,
  },
  {
    id: "prod-002",
    name: "Double Shot Espresso",
    slug: "double-shot-espresso",
    description:
      "Twice the intensity, twice the flavor. Our double shot espresso delivers a powerful caffeine kick with a velvety crema and deep roasted aroma.",
    price: 4.5,
    category: "espresso",
    image: "/images/products/double-shot-espresso.jpg",
    images: ["/images/products/double-shot-espresso.jpg"],
    sizes: ["S", "M"],
    inStock: true,
    rating: 4.7,
    reviewCount: 98,
  featured: false,
  },
  {
    id: "prod-003",
    name: "Vanilla Cold Brew",
    slug: "vanilla-cold-brew",
    description:
      "Slow-steeped for 20 hours, our cold brew is naturally sweet and incredibly smooth. Infused with real Madagascar vanilla for a creamy, refreshing finish.",
    price: 5.0,
    category: "cold-brew",
    image: "/images/products/vanilla-cold-brew.jpg",
    images: ["/images/products/vanilla-cold-brew.jpg"],
    sizes: ["M", "L", "XL"],
    inStock: true,
    rating: 4.9,
    reviewCount: 203,
  featured: true,
  },
  {
    id: "prod-004",
    name: "Nitro Cold Brew",
    slug: "nitro-cold-brew",
    description:
      "Our signature cold brew infused with nitrogen for a cascading, creamy texture. Silky smooth with a naturally sweet taste and no added sugar.",
    price: 5.5,
    category: "cold-brew",
    image: "/images/products/nitro-cold-brew.jpg",
    images: ["/images/products/nitro-cold-brew.jpg"],
    sizes: ["M", "L"],
    inStock: true,
    rating: 4.6,
    reviewCount: 156,
  featured: false,
  },
  {
    id: "prod-005",
    name: "Caramel Latte",
    slug: "caramel-latte",
    description:
      "Espresso meets steamed milk and our house-made caramel sauce. A sweet, indulgent treat topped with a drizzle of caramel and a sprinkle of sea salt.",
    price: 5.5,
    category: "latte",
    image: "/images/products/caramel-latte.jpg",
    images: ["/images/products/caramel-latte.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    rating: 4.7,
    reviewCount: 187,
  featured: true,
  },
  {
    id: "prod-006",
    name: "Matcha Latte",
    slug: "matcha-latte",
    description:
      "Ceremonial-grade Japanese matcha whisked with steamed oat milk. Earthy, creamy, and energizing with a vibrant green hue.",
    price: 6.0,
    category: "latte",
    image: "/images/products/matcha-latte.jpg",
    images: ["/images/products/matcha-latte.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    rating: 4.5,
    reviewCount: 142,
  featured: true,
  },
  {
    id: "prod-007",
    name: "Oat Milk Latte",
    slug: "oat-milk-latte",
    description:
      "Our smooth espresso paired with creamy oat milk. A plant-based delight that is rich, satisfying, and naturally sweet.",
    price: 5.0,
    category: "latte",
    image: "/images/products/oat-milk-latte.jpg",
    images: ["/images/products/oat-milk-latte.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    rating: 4.8,
    reviewCount: 165,
  featured: true,
  },
  {
    id: "prod-008",
    name: "Butter Croissant",
    slug: "butter-croissant",
    description:
      "Flaky, golden, and made with French butter. Our croissants are baked fresh every morning for the perfect coffee companion.",
    price: 3.5,
    category: "pastry",
    image: "/images/products/butter-croissant.jpg",
    images: ["/images/products/butter-croissant.jpg"],
    sizes: [],
    inStock: true,
    rating: 4.9,
    reviewCount: 231,
  featured: true,
  },
  {
    id: "prod-009",
    name: "Cinnamon Roll",
    slug: "cinnamon-roll",
    description:
      "A warm, soft cinnamon roll drizzled with cream cheese frosting. Baked with layers of cinnamon sugar and a hint of cardamom.",
    price: 4.0,
    category: "pastry",
    image: "/images/products/cinnamon-roll.jpg",
    images: ["/images/products/cinnamon-roll.jpg"],
    sizes: [],
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
  featured: false,
  },
  {
    id: "prod-010",
    name: "Blueberry Muffin",
    slug: "blueberry-muffin",
    description:
      "Loaded with fresh blueberries and topped with a golden streusel crumble. Moist, tender, and bursting with fruity flavor.",
    price: 3.0,
    category: "pastry",
    image: "/images/products/blueberry-muffin.jpg",
    images: ["/images/products/blueberry-muffin.jpg"],
    sizes: [],
    inStock: false,
    rating: 4.4,
    reviewCount: 67,
  featured: false,
  },
  {
    id: "prod-011",
    name: "Morii Coffee Mug",
    slug: "morii-coffee-mug",
    description:
      "A handcrafted ceramic mug featuring the Morii Coffee logo. 12oz capacity, microwave and dishwasher safe. Available in matte black.",
    price: 18.0,
    category: "merchandise",
    image: "/images/products/morii-mug.jpg",
    images: ["/images/products/morii-mug.jpg"],
    sizes: [],
    inStock: true,
    rating: 4.9,
    reviewCount: 54,
  featured: false,
  },
  {
    id: "prod-012",
    name: "Morii Tote Bag",
    slug: "morii-tote-bag",
    description:
      "An organic cotton tote bag with our signature Morii Coffee print. Sturdy, eco-friendly, and perfect for carrying your daily essentials.",
    price: 24.0,
    category: "merchandise",
    image: "/images/products/morii-tote-bag.jpg",
    images: ["/images/products/morii-tote-bag.jpg"],
    sizes: [],
    inStock: true,
    rating: 4.7,
    reviewCount: 38,
  featured: false,
  },
  {
    id: "prod-013",
    name: "Honey Lavender Latte",
    slug: "honey-lavender-latte",
    description:
      "A floral twist on the classic latte. Local honey and French lavender blended with espresso and steamed milk for a calming, aromatic experience.",
    price: 6.5,
    category: "latte",
    image: "/images/products/honey-lavender-latte.jpg",
    images: ["/images/products/honey-lavender-latte.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    rating: 4.8,
    reviewCount: 112,
  featured: true,
  },
  {
    id: "prod-014",
    name: "Mocha Cold Brew",
    slug: "mocha-cold-brew",
    description:
      "Rich cold brew coffee blended with dark chocolate and a touch of vanilla. Served over ice for the ultimate chocolate-coffee indulgence.",
    price: 5.5,
    category: "cold-brew",
    image: "/images/products/mocha-cold-brew.jpg",
    images: ["/images/products/mocha-cold-brew.jpg"],
    sizes: ["M", "L", "XL"],
    inStock: true,
    rating: 4.5,
    reviewCount: 78,
  featured: true,
  },
];
