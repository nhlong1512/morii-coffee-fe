import { useState, useEffect, useCallback } from "react";
import { getProducts, type GetProductsOptions } from "@/services/products-service";
import type { Product } from "@/data/products";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasNext: boolean;
  totalCount: number;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing products list
 * @param options - Query options (pagination, filters)
 * @returns Products data with loading and error states
 */
export function useProducts(options: GetProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts(options);
      setProducts(result.products);
      setHasNext(result.hasNext);
      setTotalCount(result.totalCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load products";
      setError(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.page, options.size, options.isFeatured, options.takeAll]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    hasNext,
    totalCount,
    refetch: fetchProducts,
  };
}
