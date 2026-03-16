export const APP_NAME = "Morii Coffee";

export const APP_DESCRIPTION =
  "Artisan coffee crafted with passion. Experience the perfect blend of tradition and innovation.";

export const NAV_LINKS = [
  { href: "/", label: "nav.home" },
  { href: "/products", label: "nav.products" },
  { href: "/blog", label: "nav.blog" },
  { href: "/about", label: "nav.about" },
] as const;

export const AUTH_LINKS = [
  { href: "/cart", label: "nav.cart", icon: "ShoppingCart" },
  { href: "/wishlist", label: "nav.wishlist", icon: "Heart" },
  { href: "/notifications", label: "nav.notifications", icon: "Bell" },
  { href: "/profile", label: "nav.profile", icon: "User" },
  { href: "/orders", label: "nav.orders", icon: "Package" },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://facebook.com/moriicoffee", label: "Facebook", icon: "Facebook" },
  { href: "https://instagram.com/moriicoffee", label: "Instagram", icon: "Instagram" },
  { href: "https://twitter.com/moriicoffee", label: "Twitter", icon: "Twitter" },
  { href: "https://youtube.com/moriicoffee", label: "YouTube", icon: "Youtube" },
] as const;

export const FOOTER_LINKS = {
  company: [
    { href: "/about", label: "footer.about" },
    { href: "/contact", label: "footer.contact" },
    { href: "/careers", label: "Careers" },
  ],
  legal: [
    { href: "/terms", label: "footer.terms" },
    { href: "/privacy", label: "footer.privacy" },
  ],
} as const;

export const SUPPORTED_LOCALES = ["en", "vi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const PRODUCT_CATEGORIES = [
  "espresso",
  "cold-brew",
  "latte",
  "pastry",
  "merchandise",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const ORDER_STATUSES = [
  "delivered",
  "in-transit",
  "processing",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "order",
  "promotion",
  "loyalty",
  "system",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const LOYALTY_TIERS = ["Bronze", "Silver", "Gold", "Platinum"] as const;
export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];

export const ITEMS_PER_PAGE = 12;
