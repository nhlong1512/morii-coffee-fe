export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
}

export const banners: Banner[] = [
  {
    id: "banner-001",
    title: "Savor the Moment",
    subtitle:
      "Artisan coffee crafted with passion. Experience the perfect blend of tradition and innovation.",
    cta: "Shop Now",
    ctaLink: "/products",
    image: "/images/banners/hero-coffee-cup.jpg",
  },
  {
    id: "banner-002",
    title: "New Seasonal Blend",
    subtitle:
      "Introducing our Spring Blossom blend — floral, bright, and delicately sweet. Available for a limited time.",
    cta: "Discover",
    ctaLink: "/products/spring-blossom-blend",
    image: "/images/banners/seasonal-blend.jpg",
  },
  {
    id: "banner-003",
    title: "Earn Rewards with Every Sip",
    subtitle:
      "Join the Morii Loyalty program and unlock exclusive perks, free drinks, and early access to new releases.",
    cta: "Join Now",
    ctaLink: "/loyalty",
    image: "/images/banners/loyalty-program.jpg",
  },
  {
    id: "banner-004",
    title: "Visit Our New Location",
    subtitle:
      "Our newest cafe in District 1, Ho Chi Minh City is now open. Come in for a complimentary tasting.",
    cta: "Find Us",
    ctaLink: "/stores",
    image: "/images/banners/new-store.jpg",
  },
];
