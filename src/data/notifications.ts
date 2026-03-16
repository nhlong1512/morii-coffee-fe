import type { NotificationType } from "@/lib/constants";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export const notifications: Notification[] = [
  {
    id: "notif-001",
    title: "Order Delivered",
    message:
      "Your order MRC-20250301-001 has been delivered. Enjoy your coffee!",
    type: "order",
    isRead: true,
    createdAt: "2025-03-03T10:30:00Z",
  },
  {
    id: "notif-002",
    title: "Spring Sale: 20% Off",
    message:
      "Celebrate spring with 20% off all cold brew drinks. Use code SPRING20 at checkout. Valid until March 31.",
    type: "promotion",
    isRead: false,
    createdAt: "2025-03-10T08:00:00Z",
  },
  {
    id: "notif-003",
    title: "You Earned 50 Points!",
    message:
      "Your recent purchase earned you 50 loyalty points. You now have 1,250 points — just 250 away from Gold tier!",
    type: "loyalty",
    isRead: false,
    createdAt: "2025-03-05T14:15:00Z",
  },
  {
    id: "notif-004",
    title: "Order Shipped",
    message:
      "Your order MRC-20250310-003 is on its way! Track it with tracking number TRK-5739201846.",
    type: "order",
    isRead: false,
    createdAt: "2025-03-11T09:45:00Z",
  },
  {
    id: "notif-005",
    title: "New Store Opening",
    message:
      "Our new District 1 location is now open! Visit us for a complimentary tasting this weekend.",
    type: "system",
    isRead: true,
    createdAt: "2025-03-08T12:00:00Z",
  },
  {
    id: "notif-006",
    title: "Happy Birthday!",
    message:
      "Happy Birthday from Morii Coffee! Enjoy a free drink on us. Show this notification at any location.",
    type: "promotion",
    isRead: false,
    createdAt: "2025-03-12T00:00:00Z",
  },
  {
    id: "notif-007",
    title: "App Update Available",
    message:
      "A new version of our app is available with improved performance and new features. Update now for the best experience.",
    type: "system",
    isRead: true,
    createdAt: "2025-03-01T16:00:00Z",
  },
  {
    id: "notif-008",
    title: "Double Points Weekend",
    message:
      "Earn double loyalty points on all purchases this Saturday and Sunday. Don't miss out!",
    type: "loyalty",
    isRead: false,
    createdAt: "2025-03-14T07:00:00Z",
  },
];
