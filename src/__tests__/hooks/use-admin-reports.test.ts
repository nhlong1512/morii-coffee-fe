import { act, renderHook, waitFor } from "@testing-library/react";
import { useAdminReports } from "@/hooks/use-admin-reports";
import * as reportsService from "@/services/reports-service";

jest.mock("@/services/reports-service");

const mockGetAdminReportsDashboard =
  reportsService.getAdminReportsDashboard as jest.MockedFunction<
    typeof reportsService.getAdminReportsDashboard
  >;
const mockExportAdminReports = reportsService.exportAdminReports as jest.MockedFunction<
  typeof reportsService.exportAdminReports
>;

const dashboardResponse = {
  range: {
    from: "2026-04-23",
    to: "2026-05-22",
    preset: "30D" as const,
    granularity: "day" as const,
    timezone: "Asia/Ho_Chi_Minh",
    comparisonFrom: "2026-03-24",
    comparisonTo: "2026-04-22",
  },
  cards: {
    totalRevenue: {
      value: 12500000,
      previousValue: 11800000,
      changePercent: 5.93,
      changeDirection: "up" as const,
      comparisonSupported: true,
    },
    totalOrders: {
      value: 420,
      previousValue: 398,
      changePercent: 5.53,
      changeDirection: "up" as const,
      comparisonSupported: true,
    },
    newUsers: {
      value: 91,
      previousValue: 74,
      changePercent: 22.97,
      changeDirection: "up" as const,
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
      currency: "VND" as const,
    },
    points: [],
  },
  ordersByStatus: {
    totalOrders: 420,
    items: [],
  },
  topProducts: {
    items: [],
  },
  newUsersSeries: {
    totalNewUsers: 91,
    points: [],
  },
};

describe("useAdminReports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminReportsDashboard.mockResolvedValue(dashboardResponse);
    mockExportAdminReports.mockResolvedValue(undefined);
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useAdminReports());

    expect(result.current.loading).toBe(true);
    expect(result.current.preset).toBe("30D");
  });

  it("loads dashboard data with the default range", async () => {
    const { result } = renderHook(() => useAdminReports());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetAdminReportsDashboard).toHaveBeenCalledWith({
      preset: "30D",
      timezone: "Asia/Ho_Chi_Minh",
    });
    expect(result.current.dashboard).toEqual(dashboardResponse);
  });

  it("refetches when the selected preset changes", async () => {
    const { result } = renderHook(() => useAdminReports());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGetAdminReportsDashboard.mockResolvedValue({
      ...dashboardResponse,
      range: { ...dashboardResponse.range, preset: "7D" },
    });

    act(() => {
      result.current.setPreset("7D");
    });

    await waitFor(() =>
      expect(mockGetAdminReportsDashboard).toHaveBeenLastCalledWith({
        preset: "7D",
        timezone: "Asia/Ho_Chi_Minh",
      })
    );
  });

  it("sets an error message when dashboard loading fails", async () => {
    mockGetAdminReportsDashboard.mockRejectedValue(new Error("Forbidden"));

    const { result } = renderHook(() => useAdminReports());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Forbidden");
  });

  it("exports the report with the active range", async () => {
    const { result } = renderHook(() => useAdminReports());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportReport();
    });

    expect(mockExportAdminReports).toHaveBeenCalledWith({
      preset: "30D",
      timezone: "Asia/Ho_Chi_Minh",
    });
  });

  it("sets an export error when export fails", async () => {
    mockExportAdminReports.mockRejectedValue(new Error("Export failed"));
    const { result } = renderHook(() => useAdminReports());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportReport();
    });

    expect(result.current.error).toBe("Export failed");
    expect(result.current.exporting).toBe(false);
  });
});
