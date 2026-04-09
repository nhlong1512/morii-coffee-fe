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
import type { AdminOrder } from "@/data/admin/orders";
import { useOrders } from "@/hooks/use-orders";
import { formatVND } from "@/lib/utils";
import { Eye, ShoppingCart } from "lucide-react";

const ORDER_STATUSES = ["all", "pending", "processing", "completed", "cancelled"] as const;
const PAYMENT_STATUSES = ["all", "paid", "pending", "refunded"] as const;

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
    case "pending": return "warning";
    case "processing": return "info";
    case "completed": return "success";
    case "cancelled": return "error";
    default: return "default";
  }
}

function getPaymentStatusVariant(status: string): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "paid": return "success";
    case "pending": return "warning";
    case "refunded": return "error";
    default: return "default";
  }
}

export default function AdminOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [paymentFilter, setPaymentFilter] = React.useState("all");

  const { orders } = useOrders({ search, orderStatus: statusFilter, paymentStatus: paymentFilter });

  const columns: Column<AdminOrder>[] = [
    {
      accessor: "orderNumber",
      header: "Order #",
      sortable: true,
      cell: (order) => (
        <span className="font-mono font-medium text-sm">{order.orderNumber}</span>
      ),
    },
    {
      accessor: "customerName",
      header: "Customer",
      sortable: true,
      cell: (order) => (
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      accessor: "items",
      header: "Items",
      cell: (order) => {
        const count = order.items.length;
        const first = order.items[0]?.productName ?? "";
        return (
          <span className="text-sm text-muted-foreground">
            {count === 1 ? first : `${first} +${count - 1} more`}
          </span>
        );
      },
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
      accessor: "paymentStatus",
      header: "Payment",
      cell: (order) => (
        <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="capitalize">
          {order.paymentStatus}
        </Badge>
      ),
    },
    {
      accessor: "orderStatus",
      header: "Status",
      sortable: true,
      cell: (order) => (
        <Badge variant={getOrderStatusVariant(order.orderStatus)} className="capitalize">
          {order.orderStatus}
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
            {orders.length} orders
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by customer or order #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="capitalize">{s === "all" ? "All Statuses" : s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="capitalize">{s === "all" ? "All Payments" : s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable data={orders} columns={columns} searchKey="orderNumber" />
    </div>
  );
}
