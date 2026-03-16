import type { LoyaltyTier } from "@/lib/constants";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  role: "admin" | "user";
  loyaltyPoints: number;
  tier: LoyaltyTier;
}

export const dummyUser: User = {
  id: "user-001",
  name: "Thanh Le",
  email: "thanh.le@example.com",
  avatar: "/images/user/avatar.jpg",
  phone: "+84 912 345 678",
  role: "admin",
  loyaltyPoints: 1250,
  tier: "Silver",
};
