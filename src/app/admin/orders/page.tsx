"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/admin/data-table";
import { useOrders, type AdminOrderListItem } from "@/hooks/use-orders";
import { getPaymentStatusVariant } from "@/lib/payment";
import { formatVND } from "@/lib/utils";
import { Eye, Loader2, ShoppingCart } from "lucide-react";

const PAYMENT_METHODS: Record<string, string> = {
  COD: "Cash on Delivery",
  MOMO: "MoMo",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
};

const getOrderStatuses = (t: ReturnType<typeof useTranslations>) => [
  { value: "all", label: t("allStatuses") },
  { value: "PENDING", label: t("statusPending") },
  { value: "CONFIRMED", label: t("statusConfirmed") },
  { value: "READY_TO_PICKUP", label: t("statusReadyToPickup") },
  { value: "IN_DELIVERY", label: t("statusInDelivery") },
  { value: "DELIVERED", label: t("statusDelivered") },
  { value: "REVIEWED", label: t("statusReviewed") },
  { value: "CANCELLED", label: t("statusCancelled") },
] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderStatusVariant(status: string): "success" | "warning" | "info" | "error" | "default" {
  switch (status) {
    case "PENDING": return "warning";
    case "CONFIRMED":
    case "READY_TO_PICKUP":
    case "IN_DELIVERY": return "info";
    case "DELIVERED":
    case "REVIEWED": return "success";
    case "CANCELLED": return "error";
    default: return "default";
  }
}

function getOrderStatusLabel(status: string, statuses: ReturnType<typeof getOrderStatuses>): string {
  return statuses.find((s) => s.value === status)?.label ?? status;
}

function getPaymentStatusLabel(status: string | null) {
  switch (status) {
    case "Pending":
      return "Pending";
    case "Paid":
      return "Paid";
    case "Failed":
      return "Failed";
    case "Refunded":
      return "Refunded";
    case "PartiallyRefunded":
      return "Partially Refunded";
    case "NotRequired":
      return "Not Required";
    default:
      return "Unavailable";
  }
}

export default function AdminOrdersPage() {
  const t = useTranslations("adminOrders");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const orderStatuses = React.useMemo(() => getOrderStatuses(t), [t]);

  const { orders, loading, error } = useOrders({ search, orderStatus: statusFilter });

  const columns: Column<AdminOrderListItem>[] = [
    {
      accessor: "orderNumber",
      header: t("columnOrderNumber"),
      sortable: true,
      cell: (order) => (
        <span className="font-mono font-medium text-sm">{order.orderNumber}</span>
      ),
    },
    {
      accessor: "total",
      header: t("columnTotal"),
      sortable: true,
      cell: (order) => (
        <span className="font-medium">{formatVND(order.total)}</span>
      ),
    },
    {
      accessor: "paymentMethod",
      header: t("columnPayment"),
      cell: (order) => (
        <span className="text-sm text-muted-foreground">
          {PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}
        </span>
      ),
    },
    {
      accessor: "paymentStatus",
      header: t("columnPaymentStatus"),
      cell: (order) => (
        <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
          {getPaymentStatusLabel(order.paymentStatus)}
        </Badge>
      ),
    },
    {
      accessor: "orderStatus",
      header: t("columnStatus"),
      sortable: true,
      cell: (order) => (
        <Badge variant={getOrderStatusVariant(order.orderStatus)}>
          {getOrderStatusLabel(order.orderStatus, orderStatuses)}
        </Badge>
      ),
    },
    {
      accessor: "createdAt",
      header: t("columnDate"),
      sortable: true,
      cell: (order) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(order.createdAt)}
        </span>
      ),
    },
    {
      accessor: "id",
      header: "",
      cell: (order) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loading ? "..." : t("ordersCount", { n: orders.length })}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t("orderStatus")} />
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("loading")}
        </div>
      ) : (
        <DataTable data={orders} columns={columns} searchKey="orderNumber" />
      )}
    </div>
  );
}
