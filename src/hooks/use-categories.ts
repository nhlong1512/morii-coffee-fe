import { useState, useEffect, useCallback } from "react";
import { getCategories } from "@/services/categories-service";
import type { ApiCategory } from "@/types/api";

interface UseCategoriesReturn {
  categories: ApiCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing categories list
 * @returns Categories data with loading and error states
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data.slice().sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load categories";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
