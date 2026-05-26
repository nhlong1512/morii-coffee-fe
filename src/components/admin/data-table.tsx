"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: string;
  pageSize?: number;
  selectedRows?: Set<string>;
  onSelectedRowsChange?: (rows: Set<string>) => void;
  getRowId?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKey,
  pageSize = 10,
  selectedRows,
  onSelectedRowsChange,
  getRowId,
}: DataTableProps<T>) {
  const t = useTranslations("adminCommon");
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const filteredData = React.useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter((row) => {
      const value = (row as Record<string, unknown>)[searchKey];
      if (typeof value === "string") {
        return value.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [data, search, searchKey]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSort = (accessor: string) => {
    if (sortKey === accessor) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(accessor);
      setSortDirection("asc");
    }
  };

  const allSelected =
    paginatedData.length > 0 &&
    selectedRows &&
    getRowId &&
    paginatedData.every((row) => selectedRows.has(getRowId(row)));

  const handleSelectAll = () => {
    if (!onSelectedRowsChange || !getRowId) return;
    if (allSelected) {
      const next = new Set(selectedRows);
      paginatedData.forEach((row) => next.delete(getRowId(row)));
      onSelectedRowsChange(next);
    } else {
      const next = new Set(selectedRows);
      paginatedData.forEach((row) => next.add(getRowId(row)));
      onSelectedRowsChange(next);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectedRowsChange || !getRowId || !selectedRows) return;
    const id = getRowId(row);
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectedRowsChange(next);
  };

  const renderCell = (row: T, col: Column<T>) => {
    if (col.cell) {
      return col.cell(row);
    }

    return String(
      (row as Record<string, unknown>)[String(col.accessor)] ?? ""
    );
  };

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="w-full max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      <div className="space-y-3 md:hidden">
        {paginatedData.length === 0 ? (
          <div className="rounded-md border border-border px-4 py-8 text-center text-muted-foreground">
            {t("noResults")}
          </div>
        ) : (
          paginatedData.map((row, i) => (
            <div
              key={getRowId ? getRowId(row) : i}
              className={cn(
                "rounded-xl border border-border bg-card p-4 shadow-sm",
                selectedRows &&
                  getRowId &&
                  selectedRows.has(getRowId(row)) &&
                  "border-primary/40 bg-muted/20"
              )}
            >
              {selectedRows && onSelectedRowsChange && getRowId && (
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    #{i + 1 + (currentPage - 1) * pageSize}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(getRowId(row))}
                    onChange={() => handleSelectRow(row)}
                    className="rounded border-border"
                  />
                </div>
              )}

              <div className="space-y-3">
                {columns.map((col) => (
                  <div
                    key={String(col.accessor)}
                    className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {col.header}
                    </span>
                    <div className="min-w-0 break-words text-sm text-foreground">
                      {renderCell(row, col)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {selectedRows && onSelectedRowsChange && getRowId && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className={cn(
                    "px-4 py-3 text-left font-medium text-muted-foreground",
                    col.sortable && "cursor-pointer select-none"
                  )}
                  onClick={() =>
                    col.sortable && handleSort(String(col.accessor))
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortKey === String(col.accessor) ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectedRows && onSelectedRowsChange && getRowId ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={getRowId ? getRowId(row) : i}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50",
                    selectedRows &&
                      getRowId &&
                      selectedRows.has(getRowId(row)) &&
                      "bg-muted/30"
                  )}
                >
                  {selectedRows && onSelectedRowsChange && getRowId && (
                    <td className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(getRowId(row))}
                        onChange={() => handleSelectRow(row)}
                        className="rounded border-border"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className="px-4 py-3">
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("showing", {
              from: (currentPage - 1) * pageSize + 1,
              to: Math.min(currentPage * pageSize, sortedData.length),
              total: sortedData.length,
            })}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label={t("previous")}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label={t("previous")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              {t("page", { page: currentPage, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              aria-label={t("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label={t("next")}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
