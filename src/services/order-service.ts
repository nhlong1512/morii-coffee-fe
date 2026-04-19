import type { CreateOrderRequest, Order } from "@/types";
import { orders } from "@/data/orders";

let mockOrders: Order[] = [...orders];

export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const id = `order-${Date.now()}`;
  const orderNumber = `MRC-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id,
    orderNumber,
    date: now.toISOString().slice(0, 10),
    status: "processing",
    items: request.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: item.image,
    })),
    delivery: request.delivery,
    paymentMethod: request.paymentMethod,
    subtotal: request.subtotal,
    tax: request.tax,
    shipping: request.shipping,
    discount: request.discount,
    total: request.total,
    trackingNumber: null,
  };

  mockOrders = [newOrder, ...mockOrders];
  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockOrders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockOrders.find((o) => o.id === id) ?? null;
}
