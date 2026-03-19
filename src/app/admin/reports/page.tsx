"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import { formatVND } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import {
  dashboardStats,
  revenueData,
  ordersByStatus,
  topProducts,
  newUsersData,
  loyaltyData,
} from "@/data/admin/statistics";

const CHART_COLORS = {
  primary: "#146d4d",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  red: "#EF4444",
};

type DateRange = "7D" | "30D" | "90D" | "1Y";

function filterByDateRange<T extends { date: string }>(
  data: T[],
  range: DateRange
): T[] {
  const now = new Date();
  const cutoff = new Date();
  switch (range) {
    case "7D":
      cutoff.setDate(now.getDate() - 7);
      break;
    case "30D":
      cutoff.setDate(now.getDate() - 30);
      break;
    case "90D":
      cutoff.setDate(now.getDate() - 90);
      break;
    case "1Y":
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
  }
  return data.filter((item) => new Date(item.date) >= cutoff);
}

function generateCSV(): string {
  const lines: string[] = [];

  lines.push("--- Dashboard Stats ---");
  lines.push("Metric,Value,Change (%)");
  lines.push(
    `Total Revenue,${dashboardStats.totalRevenue.value},${dashboardStats.totalRevenue.percentChange}`
  );
  lines.push(
    `Total Orders,${dashboardStats.totalOrders.value},${dashboardStats.totalOrders.percentChange}`
  );
  lines.push(
    `New Users,${dashboardStats.newUsers.value},${dashboardStats.newUsers.percentChange}`
  );
  lines.push(
    `Active Products,${dashboardStats.activeProducts.value},${dashboardStats.activeProducts.percentChange}`
  );

  lines.push("");
  lines.push("--- Revenue Data ---");
  lines.push("Date,Revenue");
  revenueData.forEach((d) => lines.push(`${d.date},${d.revenue}`));

  lines.push("");
  lines.push("--- Orders by Status ---");
  lines.push("Status,Count");
  ordersByStatus.forEach((d) => lines.push(`${d.status},${d.count}`));

  lines.push("");
  lines.push("--- Top Products ---");
  lines.push("Name,Units Sold,Revenue");
  topProducts.forEach((d) =>
    lines.push(`${d.name},${d.unitsSold},${d.revenue}`)
  );

  lines.push("");
  lines.push("--- New Users ---");
  lines.push("Date,Users");
  newUsersData.forEach((d) => lines.push(`${d.date},${d.users}`));

  lines.push("");
  lines.push("--- Loyalty Points ---");
  lines.push("Month,Issued,Redeemed");
  loyaltyData.forEach((d) =>
    lines.push(`${d.month},${d.issued},${d.redeemed}`)
  );

  return lines.join("\n");
}

export default function ReportsPage() {
  const [revenueRange, setRevenueRange] = useState<DateRange>("30D");

  const filteredRevenue = useMemo(
    () => filterByDateRange(revenueData, revenueRange),
    [revenueRange]
  );

  const handleExport = useCallback(() => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morii-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const dateRanges: DateRange[] = ["7D", "30D", "90D", "1Y"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Statistics & Reports
          </h1>
          <p className="text-muted-foreground">
            Overview of your store performance and analytics.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatVND(dashboardStats.totalRevenue.value)}
          change={dashboardStats.totalRevenue.percentChange}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={dashboardStats.totalOrders.value.toLocaleString()}
          change={dashboardStats.totalOrders.percentChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="New Users"
          value={dashboardStats.newUsers.value.toLocaleString()}
          change={dashboardStats.newUsers.percentChange}
          icon={Users}
        />
        <StatCard
          title="Active Products"
          value={dashboardStats.activeProducts.value.toLocaleString()}
          change={dashboardStats.activeProducts.percentChange}
          icon={Package}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
            <div className="flex gap-1">
              {dateRanges.map((range) => (
                <Button
                  key={range}
                  variant={revenueRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRevenueRange(range)}
                  className="px-3"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredRevenue}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value: string) => {
                  const d = new Date(value);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value: number) => formatVND(value)}
              />
              <Tooltip
                formatter={(value) => [formatVND(Number(value)), "Revenue"]}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString()
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                fill="url(#revenueGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders by Status & Top Products */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Orders by Status - Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 rounded-lg border border-border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.unitsSold.toLocaleString()} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatVND(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Users & Loyalty Points */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* New Users - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={newUsersData}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value: string) => {
                    const d = new Date(value);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  formatter={(value) => [Number(value), "New Users"]}
                  labelFormatter={(label) =>
                    new Date(String(label)).toLocaleDateString()
                  }
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={CHART_COLORS.blue}
                  strokeWidth={2}
                  fill="url(#usersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loyalty Points - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loyaltyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="issued"
                  name="Issued"
                  fill={CHART_COLORS.green}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="redeemed"
                  name="Redeemed"
                  fill={CHART_COLORS.yellow}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
