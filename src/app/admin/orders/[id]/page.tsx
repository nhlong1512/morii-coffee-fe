"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { adminOrders, type AdminOrder } from "@/data/admin/orders";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const paymentColor: Record<string, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const timelineIcon: Record<string, React.ReactNode> = {
  "Order Placed": <Package className="h-4 w-4" />,
  Processing: <Loader2 className="h-4 w-4" />,
  Completed: <CheckCircle2 className="h-4 w-4" />,
  Cancelled: <XCircle className="h-4 w-4" />,
};

const paymentMethodLabel: Record<string, string> = {
  "credit-card": "Credit Card",
  paypal: "PayPal",
  cash: "Cash",
};

export default function OrderDetailPage() {
  const params = useParams();
  const order = adminOrders.find((o) => o.id === params.id);
  const [currentStatus, setCurrentStatus] = useState<string>(
    order?.orderStatus ?? "pending"
  );
  const [statusUpdated, setStatusUpdated] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-muted-foreground mt-1">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                statusColor[order.orderStatus]
              )}
            >
              {order.orderStatus}
            </span>
          </div>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="hidden sm:flex"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Items + Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} &middot; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Discount
                      {order.couponCode && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {order.couponCode}
                        </Badge>
                      )}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {order.timeline.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Line + Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          i === order.timeline.length - 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {timelineIcon[event.status] ?? (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {i < order.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.note}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Info + Status + Actions */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Payment</p>
                  <p className="text-muted-foreground">
                    {paymentMethodLabel[order.paymentMethod]}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      paymentColor[order.paymentStatus]
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium">Customer</p>
                <p className="text-muted-foreground">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={currentStatus} onValueChange={setCurrentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={handleStatusUpdate}
                disabled={currentStatus === order.orderStatus}
              >
                {statusUpdated ? "Status Updated!" : "Update Status"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
