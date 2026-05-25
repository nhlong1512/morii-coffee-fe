"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { DollarSign, Download, Package, ShoppingCart, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAdminReports } from "@/hooks/use-admin-reports";
import {
  getMetricDisplay,
  mapNewUserChartPoints,
  mapOrderStatusChartItems,
  mapRevenueChartPoints,
  mapTopProducts,
} from "@/lib/reports";
import { formatVND } from "@/lib/utils";

const CHART_COLORS = {
  primary: "#146d4d",
  blue: "#3B82F6",
};

function SectionEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      className="border-0 bg-transparent px-0 py-10"
    />
  );
}

export default function ReportsPage() {
  const t = useTranslations("adminReports");
  const {
    dashboard,
    preset,
    presets,
    loading,
    exporting,
    error,
    setPreset,
    refetch,
    exportReport,
  } = useAdminReports();

  const revenuePoints = useMemo(
    () => mapRevenueChartPoints(dashboard?.revenueSeries.points ?? []),
    [dashboard]
  );
  const orderStatusItems = useMemo(
    () => mapOrderStatusChartItems(dashboard?.ordersByStatus.items ?? []),
    [dashboard]
  );
  const topProducts = useMemo(
    () => mapTopProducts(dashboard?.topProducts.items ?? []),
    [dashboard]
  );
  const newUserPoints = useMemo(
    () => mapNewUserChartPoints(dashboard?.newUsersSeries.points ?? []),
    [dashboard]
  );

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner variant="spinner" size="lg" />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="space-y-4 py-12">
        <ErrorMessage message={error} inline={false} />
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="py-12">
        <SectionEmptyState
          title={t("noData")}
          description={t("noDataHint")}
        />
      </div>
    );
  }

  const totalRevenue = getMetricDisplay(dashboard.cards.totalRevenue);
  const totalOrders = getMetricDisplay(dashboard.cards.totalOrders);
  const newUsers = getMetricDisplay(dashboard.cards.newUsers);
  const activeProducts = getMetricDisplay(dashboard.cards.activeProducts);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button
          onClick={() => void exportReport()}
          variant="outline"
          className="self-start sm:self-auto"
          disabled={exporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? t("exporting") : t("exportReport")}
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} inline={false} />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("totalRevenue")}
          value={formatVND(dashboard.cards.totalRevenue.value)}
          change={totalRevenue.change}
          comparisonSupported={totalRevenue.comparisonSupported}
          icon={DollarSign}
        />
        <StatCard
          title={t("totalOrders")}
          value={dashboard.cards.totalOrders.value.toLocaleString()}
          change={totalOrders.change}
          comparisonSupported={totalOrders.comparisonSupported}
          icon={ShoppingCart}
        />
        <StatCard
          title={t("newUsers")}
          value={dashboard.cards.newUsers.value.toLocaleString()}
          change={newUsers.change}
          comparisonSupported={newUsers.comparisonSupported}
          icon={Users}
        />
        <StatCard
          title={t("activeProducts")}
          value={dashboard.cards.activeProducts.value.toLocaleString()}
          change={activeProducts.change}
          comparisonSupported={activeProducts.comparisonSupported}
          icon={Package}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("revenueOverview")}</CardTitle>
            <div className="flex flex-wrap gap-1">
              {presets.map((range) => (
                <Button
                  key={range}
                  variant={preset === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreset(range)}
                  className="px-3"
                  disabled={loading}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenuePoints.length === 0 ? (
            <SectionEmptyState
              title={t("noRevenueData")}
              description={t("noRevenueDataHint")}
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenuePoints}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value: number) => formatVND(value)}
                />
                <Tooltip
                  formatter={(value) => [formatVND(Number(value)), "Revenue"]}
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
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("ordersByStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatusItems.length === 0 ? (
              <SectionEmptyState
                title={t("noOrdersData")}
                description={t("noOrdersDataHint")}
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusItems}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                  >
                    {orderStatusItems.map((entry, index) => (
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("topSellingProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <SectionEmptyState
                title={t("noProductsData")}
                description={t("noProductsDataHint")}
              />
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {product.productName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("unitsSold", { n: product.unitsSold.toLocaleString() })}
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
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("newUsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            {newUserPoints.length === 0 ? (
              <SectionEmptyState
                title={t("noNewUsersData")}
                description={t("noNewUsersDataHint")}
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={newUserPoints}>
                  <defs>
                    <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value) => [Number(value), "New Users"]}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
