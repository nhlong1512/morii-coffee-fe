"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { REPORT_PRESETS } from "@/lib/reports";
import { exportAdminReports, getAdminReportsDashboard } from "@/services/reports-service";
import type { ApiAdminReportsDashboard, ApiAdminReportsQuery, ApiReportPreset } from "@/types/api";

interface UseAdminReportsReturn {
  dashboard: ApiAdminReportsDashboard | null;
  preset: ApiReportPreset;
  presets: ApiReportPreset[];
  loading: boolean;
  exporting: boolean;
  error: string | null;
  setPreset: (preset: ApiReportPreset) => void;
  refetch: () => Promise<void>;
  exportReport: () => Promise<void>;
}

const DEFAULT_PRESET: ApiReportPreset = "30D";

export function useAdminReports(initialPreset: ApiReportPreset = DEFAULT_PRESET): UseAdminReportsReturn {
  const [dashboard, setDashboard] = useState<ApiAdminReportsDashboard | null>(null);
  const [preset, setPreset] = useState<ApiReportPreset>(initialPreset);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo<ApiAdminReportsQuery>(
    () => ({
      preset,
      timezone: "Asia/Ho_Chi_Minh",
    }),
    [preset]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminReportsDashboard(query);
      setDashboard(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reports";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      await exportAdminReports(query);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export report";
      setError(message);
    } finally {
      setExporting(false);
    }
  }, [query]);

  return {
    dashboard,
    preset,
    presets: REPORT_PRESETS,
    loading,
    exporting,
    error,
    setPreset,
    refetch: loadDashboard,
    exportReport: handleExport,
  };
}
