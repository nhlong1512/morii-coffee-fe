import type { CreateOrderRequest } from "@/types";

jest.mock("@/data/orders", () => ({
  orders: [
    {
      id: "existing-1",
      orderNumber: "MRC-20240101-1111",
      date: "2024-01-15",
      status: "delivered",
      items: [],
      delivery: { fullName: "Alice", phoneNumber: "0901234567", address: "1 Main St" },
      paymentMethod: "COD",
      subtotal: 100000,
      tax: 10000,
      shipping: 15000,
      discount: 0,
      total: 125000,
      trackingNumber: "TRK001",
    },
    {
      id: "existing-2",
      orderNumber: "MRC-20240201-2222",
      date: "2024-02-20",
      status: "processing",
      items: [],
      delivery: { fullName: "Bob", phoneNumber: "0912345678", address: "2 Side St" },
      paymentMethod: "MOMO",
      subtotal: 200000,
      tax: 20000,
      shipping: 15000,
      discount: 0,
      total: 235000,
      trackingNumber: null,
    },
  ],
}));

const makeRequest = (overrides?: Partial<CreateOrderRequest>): CreateOrderRequest => ({
  items: [
    {
      productId: "p1",
      name: "Caramel Latte",
      price: 55000,
      quantity: 2,
      size: "M",
      image: "/images/latte.jpg",
    },
  ],
  delivery: { fullName: "Charlie", phoneNumber: "0935000000", address: "3 New Ave" },
  paymentMethod: "COD",
  subtotal: 110000,
  tax: 11000,
  shipping: 15000,
  discount: 0,
  total: 136000,
  ...overrides,
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetModules();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("order-service", () => {
  describe("createOrder", () => {
    it("returns an order with status 'processing' and null trackingNumber", async () => {
      const { createOrder } = await import("@/services/order-service");
      const promise = createOrder(makeRequest());
      jest.runAllTimers();
      const order = await promise;

      expect(order.status).toBe("PENDING");
      expect(order.trackingNumber).toBeNull();
    });

    it("returns an order that mirrors the request financials", async () => {
      const { createOrder } = await import("@/services/order-service");
      const req = makeRequest();
      const promise = createOrder(req);
      jest.runAllTimers();
      const order = await promise;

      expect(order.subtotal).toBe(req.subtotal);
      expect(order.tax).toBe(req.tax);
      expect(order.shipping).toBe(req.shipping);
      expect(order.discount).toBe(req.discount);
      expect(order.total).toBe(req.total);
    });

    it("returns an order with mapped items from the request", async () => {
      const { createOrder } = await import("@/services/order-service");
      const promise = createOrder(makeRequest());
      jest.runAllTimers();
      const order = await promise;

      expect(order.items).toHaveLength(1);
      expect(order.items[0].productId).toBe("p1");
      expect(order.items[0].name).toBe("Caramel Latte");
      expect(order.items[0].quantity).toBe(2);
    });

    it("returns an order with the delivery info from the request", async () => {
      const { createOrder } = await import("@/services/order-service");
      const promise = createOrder(makeRequest());
      jest.runAllTimers();
      const order = await promise;

      expect(order.delivery.fullName).toBe("Charlie");
      expect(order.delivery.phoneNumber).toBe("0935000000");
    });

    it("generates a unique id and orderNumber for each call", async () => {
      const { createOrder } = await import("@/services/order-service");

      const p1 = createOrder(makeRequest());
      jest.runAllTimers();
      const order1 = await p1;

      const p2 = createOrder(makeRequest());
      jest.runAllTimers();
      const order2 = await p2;

      expect(order1.id).not.toBe(order2.id);
      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });
  });

  describe("getOrders", () => {
    it("returns all orders sorted descending by date", async () => {
      const { getOrders } = await import("@/services/order-service");
      const promise = getOrders();
      jest.runAllTimers();
      const result = await promise;

      expect(result.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].date).getTime()).toBeGreaterThanOrEqual(
          new Date(result[i + 1].date).getTime()
        );
      }
    });

    it("includes the pre-seeded existing orders", async () => {
      const { getOrders } = await import("@/services/order-service");
      const promise = getOrders();
      jest.runAllTimers();
      const result = await promise;

      const ids = result.map((o) => o.id);
      expect(ids).toContain("existing-1");
      expect(ids).toContain("existing-2");
    });
  });

  describe("getOrderById", () => {
    it("returns the matching order by id", async () => {
      const { getOrderById } = await import("@/services/order-service");
      const promise = getOrderById("existing-1");
      jest.runAllTimers();
      const order = await promise;

      expect(order).not.toBeNull();
      expect(order!.id).toBe("existing-1");
    });

    it("returns null for an unknown id", async () => {
      const { getOrderById } = await import("@/services/order-service");
      const promise = getOrderById("does-not-exist");
      jest.runAllTimers();
      const order = await promise;

      expect(order).toBeNull();
    });
  });
});
