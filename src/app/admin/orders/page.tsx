"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminOrders, type AdminOrder } from "@/data/admin/orders";
import { cn, formatVND } from "@/lib/utils";
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

const orderStatusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const paymentStatusColor: Record<string, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminOrdersPage() {
  const [orders] = React.useState<AdminOrder[]>(adminOrders);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [paymentFilter, setPaymentFilter] = React.useState("all");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;
      const matchesPayment =
        paymentFilter === "all" || order.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

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
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            paymentStatusColor[order.paymentStatus]
          )}
        >
          {order.paymentStatus}
        </span>
      ),
    },
    {
      accessor: "orderStatus",
      header: "Status",
      sortable: true,
      cell: (order) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            orderStatusColor[order.orderStatus]
          )}
        >
          {order.orderStatus}
        </span>
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
            {filteredOrders.length} orders
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

      <DataTable data={filteredOrders} columns={columns} searchKey="orderNumber" />
    </div>
  );
}
