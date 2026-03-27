import { useState, useEffect, useCallback } from "react";
import { getUsers, type GetUsersParams } from "@/services/user-service";
import type { ApiUserListItem, ApiMetadata } from "@/types/api";

interface UseAdminUsersReturn {
  users: ApiUserListItem[];
  metadata: ApiMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing admin users list
 * @param params - Query parameters (pagination, search, filters)
 * @returns Users data with loading and error states
 */
export function useAdminUsers(params: GetUsersParams = {}): UseAdminUsersReturn {
  const [users, setUsers] = useState<ApiUserListItem[]>([]);
  const [metadata, setMetadata] = useState<ApiMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsers(params);
      setUsers(result.items);
      setMetadata(result.metadata);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.size, params.search, params.status, params.takeAll]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    metadata,
    loading,
    error,
    refetch: fetchUsers,
  };
}
