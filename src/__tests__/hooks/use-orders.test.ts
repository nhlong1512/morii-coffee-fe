import { renderHook } from "@testing-library/react";
import { useOrders } from "@/hooks/use-orders";
import { adminOrders } from "@/data/admin/orders";

describe("useOrders", () => {
  it("returns all orders when no filters are provided", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.orders).toHaveLength(adminOrders.length);
  });

  it("loading is false by default", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.loading).toBe(false);
  });

  it("error is null by default", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.error).toBeNull();
  });

  describe("search filter", () => {
    it("filters by customerName (case-insensitive)", () => {
      const firstName = adminOrders[0].customerName.split(" ")[0];
      const { result } = renderHook(() => useOrders({ search: firstName.toLowerCase() }));
      expect(result.current.orders.every((o) =>
        o.customerName.toLowerCase().includes(firstName.toLowerCase())
      )).toBe(true);
    });

    it("filters by orderNumber", () => {
      const order = adminOrders[0];
      const { result } = renderHook(() => useOrders({ search: order.orderNumber }));
      expect(result.current.orders.some((o) => o.orderNumber === order.orderNumber)).toBe(true);
    });

    it("returns empty array when search matches nothing", () => {
      const { result } = renderHook(() => useOrders({ search: "ZZZNOMATCH" }));
      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe("orderStatus filter", () => {
    it("filters to a specific order status", () => {
      const targetStatus = "completed";
      const { result } = renderHook(() => useOrders({ orderStatus: targetStatus }));
      expect(result.current.orders.every((o) => o.orderStatus === targetStatus)).toBe(true);
    });

    it("returns all orders when orderStatus is 'all'", () => {
      const { result } = renderHook(() => useOrders({ orderStatus: "all" }));
      expect(result.current.orders).toHaveLength(adminOrders.length);
    });

    it("returns empty when no orders match the status", () => {
      const { result } = renderHook(() => useOrders({ orderStatus: "nonexistent-status" }));
      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe("paymentStatus filter", () => {
    it("filters to a specific payment status", () => {
      const targetStatus = "paid";
      const { result } = renderHook(() => useOrders({ paymentStatus: targetStatus }));
      expect(result.current.orders.every((o) => o.paymentStatus === targetStatus)).toBe(true);
    });

    it("returns all orders when paymentStatus is 'all'", () => {
      const { result } = renderHook(() => useOrders({ paymentStatus: "all" }));
      expect(result.current.orders).toHaveLength(adminOrders.length);
    });
  });

  describe("combined filters", () => {
    it("applies both search and orderStatus simultaneously", () => {
      const { result } = renderHook(() =>
        useOrders({ search: "a", orderStatus: "completed" })
      );
      expect(
        result.current.orders.every(
          (o) =>
            o.orderStatus === "completed" &&
            (o.customerName.toLowerCase().includes("a") ||
              o.orderNumber.toLowerCase().includes("a"))
        )
      ).toBe(true);
    });
  });
});
