import {
  buildAdminReportsQueryString,
  getAdminReportsDashboardPath,
  getAdminReportsExportPath,
  getMetricDisplay,
  getReportExportFilename,
  mapNewUserChartPoints,
  mapOrderStatusChartItems,
  mapRevenueChartPoints,
  mapTopProducts,
} from "@/lib/reports";
import type {
  ApiAdminReportsDashboard,
  ApiAdminReportsQuery,
  ApiAdminReportMetricCard,
} from "@/types/api";

const apiGetMock = jest.fn();
const apiGetBlobMock = jest.fn();
const appendChildMock = jest.fn();
const removeChildMock = jest.fn();
const clickMock = jest.fn();
const createElementMock = jest.fn();
const createObjectUrlMock = jest.fn();
const revokeObjectUrlMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiGetBlob: (...args: unknown[]) => apiGetBlobMock(...args),
}));

const dashboardResponse: ApiAdminReportsDashboard = {
  range: {
    from: "2026-04-23",
    to: "2026-05-22",
    preset: "30D",
    granularity: "day",
    timezone: "Asia/Ho_Chi_Minh",
    comparisonFrom: "2026-03-24",
    comparisonTo: "2026-04-22",
  },
  cards: {
    totalRevenue: {
      value: 12500000,
      previousValue: 11800000,
      changePercent: 5.93,
      changeDirection: "up",
      comparisonSupported: true,
    },
    totalOrders: {
      value: 420,
      previousValue: 398,
      changePercent: 5.53,
      changeDirection: "up",
      comparisonSupported: true,
    },
    newUsers: {
      value: 91,
      previousValue: 74,
      changePercent: 22.97,
      changeDirection: "up",
      comparisonSupported: true,
    },
    activeProducts: {
      value: 37,
      previousValue: null,
      changePercent: null,
      changeDirection: null,
      comparisonSupported: false,
    },
  },
  revenueSeries: {
    summary: {
      grossRevenue: 13200000,
      refundAmount: 700000,
      netRevenue: 12500000,
      paidOrders: 401,
      averageOrderValue: 31172.07,
      currency: "VND",
    },
    points: [
      {
        bucketStart: "2026-05-01",
        bucketEnd: "2026-05-01",
        label: "May 1",
        grossRevenue: 450000,
        refundAmount: 0,
        netRevenue: 450000,
        paidOrders: 14,
      },
    ],
  },
  ordersByStatus: {
    totalOrders: 420,
    items: [
      {
        status: "DELIVERED",
        count: 250,
        percentage: 59.52,
      },
    ],
  },
  topProducts: {
    items: [
      {
        productId: "coffee-1",
        productName: "Vietnamese Phin Filter Coffee",
        thumbnailUrl: null,
        unitsSold: 120,
        orderCount: 90,
        grossRevenue: 3720000,
      },
    ],
  },
  newUsersSeries: {
    totalNewUsers: 91,
    points: [
      {
        bucketStart: "2026-05-01",
        bucketEnd: "2026-05-01",
        label: "May 1",
        users: 8,
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  appendChildMock.mockReset();
  removeChildMock.mockReset();
  clickMock.mockReset();
  createElementMock.mockReturnValue({
    click: clickMock,
  });
  createObjectUrlMock.mockReturnValue("blob:report");
  revokeObjectUrlMock.mockReturnValue(undefined);

  Object.defineProperty(document, "body", {
    configurable: true,
    value: {
      appendChild: appendChildMock,
      removeChild: removeChildMock,
    },
  });

  Object.defineProperty(document, "createElement", {
    configurable: true,
    value: createElementMock,
  });

  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectUrlMock,
  });

  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectUrlMock,
  });
});

describe("reports-service", () => {
  it("builds a query string from report query params", () => {
    const query: ApiAdminReportsQuery = {
      preset: "30D",
      granularity: "day",
      timezone: "Asia/Ho_Chi_Minh",
    };

    expect(buildAdminReportsQueryString(query)).toBe(
      "preset=30D&granularity=day&timezone=Asia%2FHo_Chi_Minh"
    );
    expect(getAdminReportsDashboardPath(query)).toBe(
      "/v1/admin/reports/dashboard?preset=30D&granularity=day&timezone=Asia%2FHo_Chi_Minh"
    );
    expect(getAdminReportsExportPath(query)).toBe(
      "/v1/admin/reports/export?preset=30D&granularity=day&timezone=Asia%2FHo_Chi_Minh"
    );
  });

  it("fetches the admin reports dashboard", async () => {
    apiGetMock.mockResolvedValue(dashboardResponse);

    const { getAdminReportsDashboard } = await import("@/services/reports-service");
    const result = await getAdminReportsDashboard({
      preset: "30D",
      timezone: "Asia/Ho_Chi_Minh",
    });

    expect(apiGetMock).toHaveBeenCalledWith(
      "/v1/admin/reports/dashboard?preset=30D&timezone=Asia%2FHo_Chi_Minh"
    );
    expect(result).toEqual(dashboardResponse);
  });

  it("downloads the export blob using the active report query", async () => {
    apiGetBlobMock.mockResolvedValue(new Blob(["report"]));

    const { exportAdminReports } = await import("@/services/reports-service");
    const now = new Date("2026-05-22T03:00:00.000Z");
    await exportAdminReports(
      {
        preset: "7D",
        timezone: "Asia/Ho_Chi_Minh",
      },
      now
    );

    expect(apiGetBlobMock).toHaveBeenCalledWith(
      "/v1/admin/reports/export?preset=7D&timezone=Asia%2FHo_Chi_Minh"
    );
    expect(createElementMock).toHaveBeenCalledWith("a");
    expect(appendChildMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildMock).toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:report");
  });

  it("maps supported comparison values for metric display", () => {
    const metric: ApiAdminReportMetricCard = {
      value: 12500000,
      previousValue: 11800000,
      changePercent: 5.93,
      changeDirection: "up",
      comparisonSupported: true,
    };

    expect(getMetricDisplay(metric)).toEqual({
      change: 5.93,
      comparisonSupported: true,
    });
  });

  it("suppresses unsupported comparison values for metric display", () => {
    const metric: ApiAdminReportMetricCard = {
      value: 37,
      previousValue: null,
      changePercent: null,
      changeDirection: null,
      comparisonSupported: false,
    };

    expect(getMetricDisplay(metric)).toEqual({
      change: null,
      comparisonSupported: false,
    });
  });

  it("maps revenue, status, product, and user points for chart/list rendering", () => {
    expect(mapRevenueChartPoints(dashboardResponse.revenueSeries.points)).toEqual([
      {
        label: "May 1",
        revenue: 450000,
        grossRevenue: 450000,
        refundAmount: 0,
        paidOrders: 14,
      },
    ]);

    expect(mapOrderStatusChartItems(dashboardResponse.ordersByStatus.items)).toEqual([
      {
        status: "DELIVERED",
        count: 250,
        percentage: 59.52,
        fill: "hsl(142, 71%, 45%)",
      },
    ]);

    expect(mapTopProducts(dashboardResponse.topProducts.items)).toEqual([
      {
        productId: "coffee-1",
        productName: "Vietnamese Phin Filter Coffee",
        thumbnailUrl: null,
        unitsSold: 120,
        orderCount: 90,
        grossRevenue: 3720000,
        revenue: 3720000,
      },
    ]);

    expect(mapNewUserChartPoints(dashboardResponse.newUsersSeries.points)).toEqual([
      {
        label: "May 1",
        users: 8,
      },
    ]);
  });

  it("builds a stable export filename from the provided date", () => {
    expect(getReportExportFilename(new Date("2026-05-22T03:00:00.000Z"))).toBe(
      "morii-report-2026-05-22.csv"
    );
  });
});
