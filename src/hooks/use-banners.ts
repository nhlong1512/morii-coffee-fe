import { useState, useEffect, useCallback } from "react";
import { getBanners } from "@/services/banners-service";
import type { ApiBanner } from "@/types/api";

interface UseBannersReturn {
  banners: ApiBanner[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing banners list
 * @returns Banners data with loading and error states
 */
export function useBanners(): UseBannersReturn {
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBanners();
      setBanners(data.slice().sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load banners";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
  };
}
