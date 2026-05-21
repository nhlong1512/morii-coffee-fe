/**
 * Application-wide configuration constants
 */

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * API request timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  IMAGE_UPLOAD: 60000, // 60 seconds
  FILE_DOWNLOAD: 120000, // 2 minutes
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  CART: "cart",
  WISHLIST: "wishlist",
  THEME: "theme",
  LOCALE: "locale",
  RECENTLY_VIEWED: "recently_viewed",
} as const;

/**
 * Validation limits
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  PHONE_LENGTH: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * UI configuration
 */
export const UI = {
  TOAST_DURATION: 5000, // 5 seconds
  TOAST_MAX_COUNT: 3,
  DEBOUNCE_DELAY: 300, // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
  MOBILE_BREAKPOINT: 768, // pixels
} as const;

/**
 * Product configuration
 */
export const PRODUCTS = {
  MAX_IMAGES: 5,
  MAX_VARIANTS: 20,
  FEATURED_LIMIT: 8,
  RECENTLY_VIEWED_LIMIT: 10,
} as const;

/**
 * Order configuration
 */
export const ORDERS = {
  CANCELLATION_WINDOW: 15, // minutes
  MAX_ITEMS_PER_ORDER: 50,
} as const;

/**
 * Review configuration
 */
export const REVIEWS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_COMMENT_LENGTH: 1000,
} as const;

/**
 * Admin configuration
 */
export const ADMIN = {
  RECENT_ORDERS_LIMIT: 5,
  CHART_DATA_POINTS: 7, // days
  BULK_ACTION_LIMIT: 100,
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_GOOGLE_LOGIN: false,
  ENABLE_WISHLIST: true,
  ENABLE_REVIEWS: true,
  ENABLE_BLOG: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
} as const;

/**
 * External service URLs
 */
export const EXTERNAL = {
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || "",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

/**
 * Date and time formats
 */
export const DATE_FORMATS = {
  SHORT: "MMM d, yyyy",
  LONG: "MMMM d, yyyy",
  FULL: "EEEE, MMMM d, yyyy",
  TIME: "h:mm a",
  DATETIME: "MMM d, yyyy h:mm a",
} as const;

/**
 * Currency configuration
 */
export const CURRENCY = {
  CODE: "VND",
  SYMBOL: "₫",
  LOCALE: "vi-VN",
  DECIMALS: 0,
} as const;
