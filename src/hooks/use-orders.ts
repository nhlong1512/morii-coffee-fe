import { useEffect, useMemo, useState } from "react";
import { getAdminOrders } from "@/services/order-service";
import type { ApiAdminOrderSummary } from "@/types/api";

interface UseOrdersOptions {
  search?: string;
  orderStatus?: string;
}

interface UseOrdersReturn {
  orders: ApiAdminOrderSummary[];
  loading: boolean;
  error: string | null;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { search, orderStatus } = options;

  const [allOrders, setAllOrders] = useState<ApiAdminOrderSummary[]>([]);
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
        if (!cancelled) setAllOrders(data);
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
