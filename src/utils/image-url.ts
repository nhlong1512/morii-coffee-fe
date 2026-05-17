/**
 * Image URL utilities for handling image paths, fallbacks, and CDN URLs
 */

const DEFAULT_PRODUCT_IMAGE = "/images/placeholder-product.png";
const DEFAULT_AVATAR_IMAGE = "/images/placeholder-avatar.png";
const DEFAULT_BANNER_IMAGE = "/images/placeholder-banner.png";

function normalizeAppImageUrl(
  imageUrl: string | null | undefined,
  fallback: string
): string {
  if (!imageUrl) {
    return fallback;
  }

  const trimmedUrl = imageUrl.trim();
  if (!trimmedUrl) {
    return fallback;
  }

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith("images/")) {
    return `/${trimmedUrl}`;
  }

  return fallback;
}

/**
 * Get product image URL with fallback
 * @param imageUrl - Product image URL or path
 * @returns Valid image URL or fallback
 */
export function getProductImageUrl(imageUrl: string | null | undefined): string {
  return normalizeAppImageUrl(imageUrl, DEFAULT_PRODUCT_IMAGE);
}

/**
 * Get avatar image URL with fallback
 * @param avatarUrl - User avatar URL or path
 * @returns Valid image URL or fallback
 */
export function getAvatarImageUrl(avatarUrl: string | null | undefined): string {
  return normalizeAppImageUrl(avatarUrl, DEFAULT_AVATAR_IMAGE);
}

/**
 * Get banner image URL with fallback
 * @param bannerUrl - Banner image URL or path
 * @returns Valid image URL or fallback
 */
export function getBannerImageUrl(bannerUrl: string | null | undefined): string {
  return normalizeAppImageUrl(bannerUrl, DEFAULT_BANNER_IMAGE);
}

/**
 * Build a CDN URL for an image (for future CDN integration)
 * @param path - Relative image path
 * @param options - Optional CDN transformation options
 * @returns Full CDN URL
 */
export function buildCdnUrl(
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  }
): string {
  // For now, return the path as-is. When CDN is integrated, build the URL here.
  // Example: `https://cdn.example.com/${path}?w=${width}&q=${quality}&f=${format}`
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL;
  if (!cdnBase) return path;

  const params = new URLSearchParams();
  if (options?.width) params.set("w", options.width.toString());
  if (options?.height) params.set("h", options.height.toString());
  if (options?.quality) params.set("q", options.quality.toString());
  if (options?.format) params.set("f", options.format);

  const queryString = params.toString();
  return queryString ? `${cdnBase}${path}?${queryString}` : `${cdnBase}${path}`;
}

/**
 * Check if a URL is an external URL (not relative path)
 * @param url - URL to check
 * @returns True if external URL
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Get optimized image URL based on device pixel ratio and viewport
 * @param baseUrl - Base image URL
 * @param size - Target size (sm, md, lg, xl)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  size: "sm" | "md" | "lg" | "xl" = "md"
): string {
  const sizeMap = {
    sm: { width: 400, quality: 75 },
    md: { width: 800, quality: 80 },
    lg: { width: 1200, quality: 85 },
    xl: { width: 1920, quality: 90 },
  };

  const { width, quality } = sizeMap[size];
  return buildCdnUrl(baseUrl, { width, quality, format: "webp" });
}
