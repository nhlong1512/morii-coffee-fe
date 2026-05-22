"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, GripVertical, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { deleteStore, reorderStores, updateStoreStatus } from "../api";
import { useAdminStores } from "../hooks";
import {
  buildReorderStoresRequest,
  deriveAvailableCities,
  getStorePermissions,
} from "../utils";
import { StoreStatusBadge } from "./store-status-badge";
import type { StoreLocation } from "../types";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function AdminStoreList() {
  const t = useTranslations("adminStores");
  const roles = useAuthStore((state) => state.user?.roles ?? []);
  const permissions = React.useMemo(() => getStorePermissions(roles), [roles]);
  const [search, setSearch] = React.useState("");
  const [city, setCity] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleteTarget, setDeleteTarget] = React.useState<StoreLocation | null>(null);
  const [reorderMode, setReorderMode] = React.useState(false);
  const [reorderItems, setReorderItems] = React.useState<StoreLocation[]>([]);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [savingOrder, setSavingOrder] = React.useState(false);

  const { data, loading, error, refetch } = useAdminStores({
    takeAll: true,
    search: search || undefined,
    city: city !== "all" ? city : undefined,
    isActive:
      statusFilter === "all" ? undefined : statusFilter === "active",
  });

  React.useEffect(() => {
    setReorderItems(data);
  }, [data]);

  const cities = React.useMemo(() => deriveAvailableCities(data), [data]);

  const handleToggleStatus = React.useCallback(async (store: StoreLocation) => {
    setActionError(null);
    try {
      await updateStoreStatus(store.id, { isActive: !store.isActive });
      await refetch();
    } catch (toggleError) {
      setActionError(toggleError instanceof Error ? toggleError.message : t("saveFailed"));
    }
  }, [refetch, t]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteStore(deleteTarget.id);
      setDeleteTarget(null);
      await refetch();
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : t("deleteFailed"));
    }
  };

  const saveReorder = async () => {
    setSavingOrder(true);
    setActionError(null);
    try {
      await reorderStores(buildReorderStoresRequest(reorderItems));
      setReorderMode(false);
      await refetch();
    } catch (reorderError) {
      setActionError(reorderError instanceof Error ? reorderError.message : t("saveFailed"));
    } finally {
      setSavingOrder(false);
    }
  };

  const columns = React.useMemo<Column<StoreLocation>[]>(
    () => [
      {
        header: t("table.name"),
        accessor: "name",
        sortable: true,
        cell: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.slug}</p>
          </div>
        ),
      },
      {
        header: t("table.city"),
        accessor: "city",
        sortable: true,
      },
      {
        header: t("table.order"),
        accessor: "displayOrder",
        sortable: true,
      },
      {
        header: t("table.status"),
        accessor: "isActive",
        cell: (row) => <StoreStatusBadge mode="active" isActive={row.isActive} />,
      },
      {
        header: t("table.actions"),
        accessor: "id",
        cell: (row) => (
          <div className="flex items-center gap-1">
            {permissions.canWriteStores && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={ROUTES.ADMIN.STORES_EDIT(row.id)} aria-label={t("edit")}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {permissions.canWriteStores && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleStatus(row)}
                aria-label={t("toggleActive")}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            )}
            {permissions.canWriteStores && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
                aria-label={t("delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [handleToggleStatus, permissions.canWriteStores, t]
  );

  if (!permissions.canAccessAdminStores) {
    return (
      <EmptyState
        icon={<MapPin className="h-10 w-10" />}
        title={t("forbiddenTitle")}
        description={t("forbiddenDescription")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canReorderStores && (
            <Button variant="outline" onClick={() => setReorderMode((value) => !value)}>
              <GripVertical className="h-4 w-4" />
              {reorderMode ? t("doneReordering") : t("reorder")}
            </Button>
          )}
          {permissions.canWriteStores && (
            <Button asChild>
              <Link href={ROUTES.ADMIN.STORES_NEW}>
                <Plus className="h-4 w-4" />
                {t("addStore")}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {actionError && <ErrorMessage message={actionError} inline={false} />}

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
        />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder={t("cityFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCities")}</SelectItem>
            {cities.map((cityValue) => (
              <SelectItem key={cityValue} value={cityValue}>
                {cityValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t("statusFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner variant="spinner" size="md" />
        </div>
      ) : error ? (
        <div className="space-y-4 py-12 text-center">
          <ErrorMessage message={error} inline={false} />
          <Button variant="outline" onClick={refetch}>
            {t("retry")}
          </Button>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-10 w-10" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : reorderMode ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("reorderHint")}</p>
          <div className="space-y-3">
            {reorderItems.map((store, index) => (
              <div
                key={store.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {store.city} · #{index + 1}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`${t("moveUp")} ${store.name}`}
                    disabled={index === 0}
                    onClick={() => setReorderItems((items) => moveItem(items, index, index - 1))}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`${t("moveDown")} ${store.name}`}
                    disabled={index === reorderItems.length - 1}
                    onClick={() => setReorderItems((items) => moveItem(items, index, index + 1))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={saveReorder} disabled={savingOrder}>
              {savingOrder ? t("saving") : t("saveOrder")}
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchKey="name"
          searchPlaceholder={t("searchPlaceholder")}
          pageSize={10}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("deleteTitle")}
        description={deleteTarget ? t("deleteDescription", { name: deleteTarget.name }) : ""}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
