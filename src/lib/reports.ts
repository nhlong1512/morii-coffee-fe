import type {
  ApiAdminNewUserPoint,
  ApiAdminOrderStatusItem,
  ApiAdminReportMetricCard,
  ApiAdminReportsQuery,
  ApiAdminRevenuePoint,
  ApiAdminTopProduct,
  ApiReportPreset,
} from "@/types/api";

export const REPORT_PRESETS: ApiReportPreset[] = ["7D", "30D", "90D", "1Y"];

const ORDER_STATUS_FILL: Record<string, string> = {
  DELIVERED: "hsl(142, 71%, 45%)",
  REVIEWED: "hsl(142, 71%, 45%)",
  CONFIRMED: "hsl(217, 91%, 60%)",
  READY_TO_PICKUP: "hsl(217, 91%, 60%)",
  IN_DELIVERY: "hsl(217, 91%, 60%)",
  PENDING: "hsl(45, 93%, 47%)",
  CANCELLED: "hsl(0, 84%, 60%)",
};

export interface ReportMetricDisplay {
  change: number | null;
  comparisonSupported: boolean;
}

export interface ReportRevenueChartPoint {
  label: string;
  revenue: number;
  grossRevenue: number;
  refundAmount: number;
  paidOrders: number;
}

export interface ReportOrderStatusChartItem extends ApiAdminOrderStatusItem {
  fill: string;
}

export interface ReportTopProductItem extends ApiAdminTopProduct {
  revenue: number;
}

export interface ReportUserChartPoint {
  label: string;
  users: number;
}

export function buildAdminReportsQueryString(query: ApiAdminReportsQuery = {}): string {
  const params = new URLSearchParams();

  if (query.preset) params.set("preset", query.preset);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.granularity) params.set("granularity", query.granularity);
  if (query.timezone) params.set("timezone", query.timezone);

  return params.toString();
}

export function getAdminReportsDashboardPath(query: ApiAdminReportsQuery = {}): string {
  const queryString = buildAdminReportsQueryString(query);
  return queryString
    ? `/v1/admin/reports/dashboard?${queryString}`
    : "/v1/admin/reports/dashboard";
}

export function getAdminReportsExportPath(query: ApiAdminReportsQuery = {}): string {
  const queryString = buildAdminReportsQueryString(query);
  return queryString
    ? `/v1/admin/reports/export?${queryString}`
    : "/v1/admin/reports/export";
}

export function getMetricDisplay(metric: ApiAdminReportMetricCard): ReportMetricDisplay {
  return {
    change: metric.comparisonSupported ? metric.changePercent : null,
    comparisonSupported: metric.comparisonSupported,
  };
}

export function mapRevenueChartPoints(points: ApiAdminRevenuePoint[]): ReportRevenueChartPoint[] {
  return points.map((point) => ({
    label: point.label,
    revenue: point.netRevenue,
    grossRevenue: point.grossRevenue,
    refundAmount: point.refundAmount,
    paidOrders: point.paidOrders,
  }));
}

export function mapOrderStatusChartItems(
  items: ApiAdminOrderStatusItem[]
): ReportOrderStatusChartItem[] {
  return items.map((item) => ({
    ...item,
    fill: ORDER_STATUS_FILL[item.status] ?? "hsl(215, 16%, 47%)",
  }));
}

export function mapTopProducts(items: ApiAdminTopProduct[]): ReportTopProductItem[] {
  return items.map((item) => ({
    ...item,
    revenue: item.grossRevenue,
  }));
}

export function mapNewUserChartPoints(points: ApiAdminNewUserPoint[]): ReportUserChartPoint[] {
  return points.map((point) => ({
    label: point.label,
    users: point.users,
  }));
}

export function getReportExportFilename(date: Date = new Date()): string {
  return `morii-report-${date.toISOString().split("T")[0]}.csv`;
}
