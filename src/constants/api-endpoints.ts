/**
 * API endpoint constants for centralized endpoint management
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH: `${BASE_URL}/auth/refresh`,
    VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
    RESEND_VERIFICATION: `${BASE_URL}/auth/resend-verification`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    GOOGLE_LOGIN: `${BASE_URL}/auth/google`,
  },

  // User endpoints
  USERS: {
    PROFILE: `${BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
    UPLOAD_AVATAR: `${BASE_URL}/users/avatar`,
    GET_USERS: `${BASE_URL}/users`,
    GET_USER: (id: string) => `${BASE_URL}/users/${id}`,
  },

  // Product endpoints
  PRODUCTS: {
    LIST: `${BASE_URL}/products`,
    DETAIL: (id: string) => `${BASE_URL}/products/${id}`,
    SEARCH: `${BASE_URL}/products/search`,
    FEATURED: `${BASE_URL}/products/featured`,
  },

  // Category endpoints
  CATEGORIES: {
    LIST: `${BASE_URL}/categories`,
    DETAIL: (id: string) => `${BASE_URL}/categories/${id}`,
    PRODUCTS: (id: string) => `${BASE_URL}/categories/${id}/products`,
  },

  // Order endpoints
  ORDERS: {
    LIST: `${BASE_URL}/orders`,
    CREATE: `${BASE_URL}/orders`,
    DETAIL: (id: string) => `${BASE_URL}/orders/${id}`,
    CANCEL: (id: string) => `${BASE_URL}/orders/${id}/cancel`,
  },

  // Review endpoints
  REVIEWS: {
    LIST: `${BASE_URL}/reviews`,
    CREATE: `${BASE_URL}/reviews`,
    BY_PRODUCT: (productId: string) => `${BASE_URL}/reviews?productId=${productId}`,
  },

  // Blog endpoints
  BLOGS: {
    LIST: `${BASE_URL}/blogs`,
    DETAIL: (id: string) => `${BASE_URL}/blogs/${id}`,
    COMMENTS: (id: string) => `${BASE_URL}/blogs/${id}/comments`,
    ADD_COMMENT: (id: string) => `${BASE_URL}/blogs/${id}/comments`,
  },

  // Store endpoints
  STORES: {
    LIST: `${BASE_URL}/stores`,
    DETAIL: (id: string) => `${BASE_URL}/stores/${id}`,
  },

  // Loyalty endpoints
  LOYALTY: {
    POINTS: `${BASE_URL}/loyalty/points`,
    HISTORY: `${BASE_URL}/loyalty/history`,
    REDEEM: `${BASE_URL}/loyalty/redeem`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URL}/notifications/read-all`,
  },

  // Feedback endpoints
  FEEDBACK: {
    SUBMIT: `${BASE_URL}/feedback`,
  },

  // Banner endpoints
  BANNERS: {
    LIST: `${BASE_URL}/banners`,
    DETAIL: (id: string) => `${BASE_URL}/banners/${id}`,
    CREATE: `${BASE_URL}/banners`,
    UPDATE: (id: string) => `${BASE_URL}/banners/${id}`,
    DELETE: (id: string) => `${BASE_URL}/banners/${id}`,
  },

  // Admin endpoints
  ADMIN: {
    // Product management
    PRODUCTS: {
      LIST: `${BASE_URL}/admin/products`,
      CREATE: `${BASE_URL}/admin/products`,
      DETAIL: (id: string) => `${BASE_URL}/admin/products/${id}`,
      UPDATE: (id: string) => `${BASE_URL}/admin/products/${id}`,
      DELETE: (id: string) => `${BASE_URL}/admin/products/${id}`,
    },

    // User management
    USERS: {
      LIST: `${BASE_URL}/admin/users`,
      DETAIL: (id: string) => `${BASE_URL}/admin/users/${id}`,
      UPDATE: (id: string) => `${BASE_URL}/admin/users/${id}`,
      DELETE: (id: string) => `${BASE_URL}/admin/users/${id}`,
    },

    // Order management
    ORDERS: {
      LIST: `${BASE_URL}/admin/orders`,
      DETAIL: (id: string) => `${BASE_URL}/admin/orders/${id}`,
      UPDATE_STATUS: (id: string) => `${BASE_URL}/admin/orders/${id}/status`,
    },

    // Reports and analytics
    REPORTS: {
      DASHBOARD: `${BASE_URL}/admin/reports`,
      SALES: `${BASE_URL}/admin/reports/sales`,
      PRODUCTS: `${BASE_URL}/admin/reports/products`,
      USERS: `${BASE_URL}/admin/reports/users`,
    },

    // Promotions
    PROMOTIONS: {
      LIST: `${BASE_URL}/admin/promotions`,
      CREATE: `${BASE_URL}/admin/promotions`,
      DETAIL: (id: string) => `${BASE_URL}/admin/promotions/${id}`,
      UPDATE: (id: string) => `${BASE_URL}/admin/promotions/${id}`,
      DELETE: (id: string) => `${BASE_URL}/admin/promotions/${id}`,
    },
  },
} as const;

/**
 * Build a URL with query parameters
 * @param baseUrl - Base URL
 * @param params - Query parameters object
 * @returns Full URL with query string
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
