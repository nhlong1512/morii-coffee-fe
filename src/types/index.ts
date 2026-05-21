import type { OrderStatus } from "@/lib/constants";

export type { Product } from "@/data/products";
export type { ProductCategory, OrderStatus } from "@/lib/constants";
export { ProductSize } from "@/enums";

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

export interface DeliveryInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
}

export type PaymentMethod = "COD" | "MOMO" | "PAYPAL" | "STRIPE";
export type PaymentStatus =
  | "NotRequired"
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded"
  | "PartiallyRefunded";
export type PaymentAttemptStatus =
  | "Created"
  | "Succeeded"
  | "Failed"
  | "Expired";

export interface OrderPaymentInfo {
  paymentStatus: PaymentStatus;
  attemptCount: number;
  latestPaymentId: string | null;
  latestAttemptStatus: PaymentAttemptStatus | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  failureReason: string | null;
  latestAttemptCreatedAt: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: DeliveryInfo;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
  paymentInfo: OrderPaymentInfo | null;
}

export interface CreateOrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
  saveDeliveryProfile: boolean;
}

export interface OrderItem {
  productId: string;
  variantId?: string | null;
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

export interface CartItem {
  cartItemId?: string | null;
  productId: string;
  variantId?: string | null;
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
