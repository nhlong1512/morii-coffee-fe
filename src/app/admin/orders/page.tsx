"use client";

import * as React from "react";
import Link from "next/link";
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
import { useOrders } from "@/hooks/use-orders";
import { formatVND } from "@/lib/utils";
import type { ApiAdminOrderSummary } from "@/types/api";
import { Eye, Loader2, ShoppingCart } from "lucide-react";

const ORDER_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "READY_TO_PICKUP", label: "Ready to Pickup" },
  { value: "IN_DELIVERY", label: "In Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const PAYMENT_METHODS: Record<string, string> = {
  COD: "Cash on Delivery",
  MOMO: "MoMo",
  PAYPAL: "PayPal",
};

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

function getOrderStatusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export default function AdminOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { orders, loading, error } = useOrders({ search, orderStatus: statusFilter });

  const columns: Column<ApiAdminOrderSummary>[] = [
    {
      accessor: "orderNumber",
      header: "Order #",
      sortable: true,
      cell: (order) => (
        <span className="font-mono font-medium text-sm">{order.orderNumber}</span>
      ),
    },
    {
      accessor: "total",
      header: "Total",
      sortable: true,
      cell: (order) => (
        <span className="font-medium">{formatVND(order.total)}</span>
      ),
    },
    {
      accessor: "paymentMethod",
      header: "Payment",
      cell: (order) => (
        <span className="text-sm text-muted-foreground">
          {PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}
        </span>
      ),
    },
    {
      accessor: "orderStatus",
      header: "Status",
      sortable: true,
      cell: (order) => (
        <Badge variant={getOrderStatusVariant(order.orderStatus)}>
          {getOrderStatusLabel(order.orderStatus)}
        </Badge>
      ),
    },
    {
      accessor: "createdAt",
      header: "Date",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loading ? "..." : `${orders.length} orders`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by order #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
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
          Loading orders...
        </div>
      ) : (
        <DataTable data={orders} columns={columns} searchKey="orderNumber" />
      )}
    </div>
  );
}
