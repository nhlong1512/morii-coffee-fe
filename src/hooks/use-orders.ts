import { useEffect, useMemo, useState } from "react";
import { getAdminOrders } from "@/services/order-service";
import { getOrderPaymentSummary } from "@/services/payment-service";
import { getFallbackPaymentStatus } from "@/lib/payment";
import type { ApiAdminOrderSummary } from "@/types/api";
import type { PaymentStatus } from "@/types";

export interface AdminOrderListItem extends ApiAdminOrderSummary {
  paymentStatus: PaymentStatus | null;
}

interface UseOrdersOptions {
  search?: string;
  orderStatus?: string;
}

interface UseOrdersReturn {
  orders: AdminOrderListItem[];
  loading: boolean;
  error: string | null;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { search, orderStatus } = options;

  const [allOrders, setAllOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusParam = orderStatus && orderStatus !== "all" ? orderStatus : undefined;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminOrders({ status: statusParam });
        const enrichedOrders = await Promise.all(
          data.map(async (order) => {
            const providedPaymentStatus =
              order.paymentStatus ?? order.paymentInfo?.paymentStatus ?? null;
            const fallbackPaymentStatus =
              providedPaymentStatus ?? getFallbackPaymentStatus(order.paymentMethod);

            if (fallbackPaymentStatus) {
              return {
                ...order,
                paymentStatus: fallbackPaymentStatus,
              };
            }

            try {
              const paymentSummary = await getOrderPaymentSummary(order.id);
              return {
                ...order,
                paymentStatus: paymentSummary?.paymentStatus ?? fallbackPaymentStatus,
              };
            } catch {
              return {
                ...order,
                paymentStatus: fallbackPaymentStatus,
              };
            }
          })
        );

        if (!cancelled) setAllOrders(enrichedOrders);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [statusParam]);

  const orders = useMemo(() => {
    if (!search) return allOrders;
    const q = search.toLowerCase();
    return allOrders.filter((o) => o.orderNumber.toLowerCase().includes(q));
  }, [allOrders, search]);

  return { orders, loading, error };
}
