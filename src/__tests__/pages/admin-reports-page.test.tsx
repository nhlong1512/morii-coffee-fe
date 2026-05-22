import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReportsPage from "@/app/admin/reports/page";

const useAdminReportsMock = jest.fn();

jest.mock("@/hooks/use-admin-reports", () => ({
  useAdminReports: (...args: unknown[]) => useAdminReportsMock(...args),
}));

jest.mock("recharts", () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const defsPassthrough = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="chart-defs">{children}</div>
  );
  const stop = () => <div data-testid="chart-stop" />;

  return {
    ResponsiveContainer: passthrough,
    LineChart: passthrough,
    Line: () => <div>line-chart</div>,
    XAxis: () => <div>x-axis</div>,
    YAxis: () => <div>y-axis</div>,
    Tooltip: () => <div>tooltip</div>,
    PieChart: passthrough,
    Pie: passthrough,
    Cell: () => <div>cell</div>,
    Legend: () => <div>legend</div>,
    AreaChart: passthrough,
    Area: () => <div>area-chart</div>,
    CartesianGrid: () => <div>grid</div>,
    defs: defsPassthrough,
    linearGradient: defsPassthrough,
    stop,
  };
});

const baseHookResult = {
  dashboard: {
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
  },
  preset: "30D" as const,
  presets: ["7D", "30D", "90D", "1Y"] as const,
  loading: false,
  exporting: false,
  error: null,
  setPreset: jest.fn(),
  refetch: jest.fn().mockResolvedValue(undefined),
  exportReport: jest.fn().mockResolvedValue(undefined),
};

describe("ReportsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdminReportsMock.mockReturnValue(baseHookResult);
  });

  it("renders the live dashboard sections", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Statistics & Reports")).toBeInTheDocument();
    expect(screen.getByText("Revenue Overview")).toBeInTheDocument();
    expect(screen.getByText("Orders by Status")).toBeInTheDocument();
    expect(screen.getByText("Top Selling Products")).toBeInTheDocument();
    expect(screen.getAllByText("New Users")).toHaveLength(2);
    expect(screen.getByText("Vietnamese Phin Filter Coffee")).toBeInTheDocument();
    expect(screen.getByText("Current snapshot")).toBeInTheDocument();
  });

  it("shows a blocking spinner while loading without data", () => {
    useAdminReportsMock.mockReturnValue({
      ...baseHookResult,
      dashboard: null,
      loading: true,
    });

    const { container } = render(<ReportsPage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("shows a retryable error when the initial dashboard load fails", () => {
    useAdminReportsMock.mockReturnValue({
      ...baseHookResult,
      dashboard: null,
      error: "Forbidden",
    });

    render(<ReportsPage />);

    expect(screen.getByText("Forbidden")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders section empty states when dashboard sections have no data", () => {
    useAdminReportsMock.mockReturnValue({
      ...baseHookResult,
      dashboard: {
        ...baseHookResult.dashboard,
        revenueSeries: {
          ...baseHookResult.dashboard.revenueSeries,
          points: [],
        },
        ordersByStatus: {
          totalOrders: 0,
          items: [],
        },
        topProducts: {
          items: [],
        },
        newUsersSeries: {
          totalNewUsers: 0,
          points: [],
        },
      },
    });

    render(<ReportsPage />);

    expect(screen.getByText("No revenue data in this period")).toBeInTheDocument();
    expect(screen.getByText("No orders in this period")).toBeInTheDocument();
    expect(screen.getByText("No product sales in this period")).toBeInTheDocument();
    expect(screen.getByText("No new users in this period")).toBeInTheDocument();
  });

  it("updates the active range when a preset is selected", () => {
    render(<ReportsPage />);

    fireEvent.click(screen.getByRole("button", { name: "7D" }));

    expect(baseHookResult.setPreset).toHaveBeenCalledWith("7D");
  });

  it("triggers export from the active dashboard view", async () => {
    render(<ReportsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Export Report" }));

    await waitFor(() => {
      expect(baseHookResult.exportReport).toHaveBeenCalled();
    });
  });
});
