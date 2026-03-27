"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from "lucide-react";

export interface DataTableColumn<T> {
  /**
   * Key of the data property to display
   */
  key: keyof T;
  /**
   * Column header text
   */
  header: string;
  /**
   * Optional custom cell renderer
   */
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
  /**
   * Whether this column is sortable
   */
  sortable?: boolean;
  /**
   * Column width (CSS value)
   */
  width?: string;
  /**
   * Additional header cell classes
   */
  headerClassName?: string;
  /**
   * Additional body cell classes
   */
  cellClassName?: string;
}

export interface DataTableProps<T> {
  /**
   * Array of data rows
   */
  data: T[];
  /**
   * Column definitions
   */
  columns: DataTableColumn<T>[];
  /**
   * Whether the table is loading
   */
  isLoading?: boolean;
  /**
   * Custom empty state content
   */
  emptyState?: React.ReactNode;
  /**
   * Pagination configuration
   */
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  /**
   * Sorting configuration
   */
  sorting?: {
    sortBy: keyof T;
    sortOrder: "asc" | "desc";
    onSort: (key: keyof T) => void;
  };
  /**
   * Additional table classes
   */
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  emptyState,
  pagination,
  sorting,
  className,
}: DataTableProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={cn(
                        "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                        column.headerClassName
                      )}
                      style={{ width: column.width }}
                    >
                      <Skeleton variant="text" width="60%" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border last:border-0">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn("px-4 py-3 text-sm", column.cellClassName)}
                      >
                        <Skeleton variant="text" width="80%" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {pagination && (
          <Skeleton variant="rectangular" height={40} width={200} />
        )}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={className}>
        {emptyState || (
          <EmptyState
            title="No data found"
            description="There are no records to display at this time."
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.sortable && "cursor-pointer select-none hover:text-foreground",
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                    onClick={() => {
                      if (column.sortable && sorting) {
                        sorting.onSort(column.key);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && sorting && sorting.sortBy === column.key && (
                        sorting.sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn("px-4 py-3 text-sm text-foreground", column.cellClassName)}
                    >
                      {column.cell
                        ? column.cell(row[column.key], row)
                        : String(row[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";
