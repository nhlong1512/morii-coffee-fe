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

export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  espresso: "bg-amber-900/10 text-amber-900 dark:bg-amber-400/10 dark:text-amber-400",
  "cold-brew": "bg-sky-600/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
  latte: "bg-orange-500/10 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400",
  pastry: "bg-pink-500/10 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400",
  merchandise: "bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-400",
};

export const TAX_RATE = 0.08;

export const SIZE_PRICE_MODIFIERS: Record<string, number> = {
  S: 0,
  M: 0.5,
  L: 1,
  XL: 1.5,
};
