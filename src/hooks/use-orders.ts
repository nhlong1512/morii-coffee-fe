import { useState, useMemo } from "react";
import { adminOrders, type AdminOrder } from "@/data/admin/orders";

interface UseOrdersOptions {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
}

interface UseOrdersReturn {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing admin orders list with filtering
 * @param options - Filter options (search, orderStatus, paymentStatus)
 * @returns Filtered orders with loading and error states
 */
export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const { search, orderStatus, paymentStatus } = options;

  const orders = useMemo(() => {
    return adminOrders.filter((order) => {
      const matchesSearch =
        !search ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !orderStatus || orderStatus === "all" || order.orderStatus === orderStatus;
      const matchesPayment = !paymentStatus || paymentStatus === "all" || order.paymentStatus === paymentStatus;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [search, orderStatus, paymentStatus]);

  return { orders, loading, error };
}
