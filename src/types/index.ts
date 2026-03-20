export type { Product } from "@/data/products";
export type { ProductCategory, OrderStatus } from "@/lib/constants";
export type { ApiProductSize as ProductSize } from "@/types/api";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "delivered" | "in-transit" | "processing" | "cancelled";
  items: OrderItem[];
  total: number;
  trackingNumber: string | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "loyalty" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
}
