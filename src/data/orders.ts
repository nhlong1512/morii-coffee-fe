import type { OrderStatus } from "@/lib/constants";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  trackingNumber?: string;
}

export const orders: Order[] = [
  {
    id: "order-001",
    orderNumber: "MRC-20250301-001",
    date: "2025-03-01",
    status: "delivered",
    items: [
      {
        productId: "prod-003",
        name: "Vanilla Cold Brew",
        price: 5.0,
        quantity: 2,
        size: "L",
        image: "/images/products/vanilla-cold-brew.jpg",
      },
      {
        productId: "prod-008",
        name: "Butter Croissant",
        price: 3.5,
        quantity: 1,
        image: "/images/products/butter-croissant.jpg",
      },
    ],
    total: 13.5,
    trackingNumber: "TRK-9283746501",
  },
  {
    id: "order-002",
    orderNumber: "MRC-20250215-002",
    date: "2025-02-15",
    status: "delivered",
    items: [
      {
        productId: "prod-011",
        name: "Morii Coffee Mug",
        price: 18.0,
        quantity: 1,
        image: "/images/products/morii-mug.jpg",
      },
      {
        productId: "prod-012",
        name: "Morii Tote Bag",
        price: 24.0,
        quantity: 1,
        image: "/images/products/morii-tote-bag.jpg",
      },
    ],
    total: 42.0,
    trackingNumber: "TRK-1847362950",
  },
  {
    id: "order-003",
    orderNumber: "MRC-20250310-003",
    date: "2025-03-10",
    status: "in-transit",
    items: [
      {
        productId: "prod-005",
        name: "Caramel Latte",
        price: 5.5,
        quantity: 3,
        size: "M",
        image: "/images/products/caramel-latte.jpg",
      },
    ],
    total: 16.5,
    trackingNumber: "TRK-5739201846",
  },
  {
    id: "order-004",
    orderNumber: "MRC-20250312-004",
    date: "2025-03-12",
    status: "processing",
    items: [
      {
        productId: "prod-013",
        name: "Honey Lavender Latte",
        price: 6.5,
        quantity: 1,
        size: "L",
        image: "/images/products/honey-lavender-latte.jpg",
      },
      {
        productId: "prod-009",
        name: "Cinnamon Roll",
        price: 4.0,
        quantity: 2,
        image: "/images/products/cinnamon-roll.jpg",
      },
    ],
    total: 14.5,
  },
  {
    id: "order-005",
    orderNumber: "MRC-20250120-005",
    date: "2025-01-20",
    status: "cancelled",
    items: [
      {
        productId: "prod-006",
        name: "Matcha Latte",
        price: 6.0,
        quantity: 2,
        size: "M",
        image: "/images/products/matcha-latte.jpg",
      },
    ],
    total: 12.0,
  },
];
