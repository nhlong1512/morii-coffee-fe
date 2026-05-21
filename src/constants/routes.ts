/**
 * Application route constants for type-safe navigation
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  MENU: "/menu",
  ABOUT: "/about",
  STORES: "/stores",
  BLOG: "/blog",
  CONTACT: "/contact",

  // Auth routes
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CHANGE_PASSWORD: "/change-password",
  VERIFY_EMAIL: "/verify-email",
  AUTH_CALLBACK: "/auth/callback",

  // User routes
  PROFILE: "/profile",
  ORDERS: "/orders",
  WISHLIST: "/wishlist",
  LOYALTY: "/loyalty",
  NOTIFICATIONS: "/notifications",

  // Product routes
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORY: (slug: string) => `/menu/${slug}`,

  // Order routes
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: (orderId: string) => `/orders/${orderId}`,
  ORDER_DETAIL: (orderId: string) => `/orders/${orderId}`,

  // Blog routes
  BLOG_POST: (slug: string) => `/blog/${slug}`,

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    LOGIN: "/admin/login",
    DASHBOARD: "/admin",

    // Product management
    PRODUCTS: "/admin/products",
    PRODUCTS_NEW: "/admin/products/new",
    PRODUCTS_EDIT: (id: string) => `/admin/products/edit/${id}`,

    // User management
    USERS: "/admin/users",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,

    // Order management
    ORDERS: "/admin/orders",
    ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,

    // Banner management
    BANNERS: "/admin/banners",
    BANNERS_NEW: "/admin/banners/new",
    BANNERS_EDIT: (id: string) => `/admin/banners/edit/${id}`,

    // Blog management
    BLOGS: "/admin/blogs",
    BLOGS_NEW: "/admin/blogs/new",
    BLOGS_EDIT: (id: string) => `/admin/blogs/edit/${id}`,

    // Reports and analytics
    REPORTS: "/admin/reports",

    // Promotions and rewards
    PROMOTIONS: "/admin/promotions",
    PROMOTIONS_NEW: "/admin/promotions/new",
    PROMOTIONS_EDIT: (id: string) => `/admin/promotions/edit/${id}`,

    // Settings
    SETTINGS: "/admin/settings",
  },
} as const;

/**
 * Check if a route is an admin route
 * @param path - Route path to check
 * @returns True if admin route
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith("/admin");
}

/**
 * Check if a route is a public route (no auth required)
 * @param path - Route path to check
 * @returns True if public route
 */
export function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.MENU,
    ROUTES.ABOUT,
    ROUTES.STORES,
    ROUTES.BLOG,
    ROUTES.CONTACT,
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
    ROUTES.AUTH_CALLBACK,
  ];

  return publicRoutes.some((route) => path === route || path.startsWith(route));
}

/**
 * Check if a route requires authentication
 * @param path - Route path to check
 * @returns True if auth required
 */
export function requiresAuth(path: string): boolean {
  return !isPublicRoute(path);
}
