import { useState, useCallback, useMemo } from "react";
import { PAGINATION } from "@/constants/app-config";

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalCount?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;
  offset: number;
  limit: number;
}

/**
 * Hook for managing pagination state
 * @param options - Pagination configuration
 * @returns Pagination state and controls
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE,
    pageSize: initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    totalCount = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize) || 1;
  }, [totalCount, pageSize]);

  const hasNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPrevious = useMemo(() => {
    return page > 1;
  }, [page]);

  const offset = useMemo(() => {
    return (page - 1) * pageSize;
  }, [page, pageSize]);

  const limit = useMemo(() => {
    return pageSize;
  }, [pageSize]);

  const goToPage = useCallback(
    (newPage: number) => {
      const clampedPage = Math.max(1, Math.min(newPage, totalPages));
      setPage(clampedPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage((prev) => prev + 1);
    }
  }, [hasNext]);

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setPage((prev) => prev - 1);
    }
  }, [hasPrevious]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to first page when page size changes
  }, []);

  return {
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrevious,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize: handleSetPageSize,
    offset,
    limit,
  };
}
