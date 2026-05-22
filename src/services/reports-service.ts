import { apiGet, apiGetBlob } from "@/lib/api";
import {
  getAdminReportsDashboardPath,
  getAdminReportsExportPath,
  getReportExportFilename,
} from "@/lib/reports";
import type { ApiAdminReportsDashboard, ApiAdminReportsQuery } from "@/types/api";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function getAdminReportsDashboard(
  query: ApiAdminReportsQuery = {}
): Promise<ApiAdminReportsDashboard> {
  return apiGet<ApiAdminReportsDashboard>(getAdminReportsDashboardPath(query));
}

export async function exportAdminReports(
  query: ApiAdminReportsQuery = {},
  now: Date = new Date()
): Promise<void> {
  const blob = await apiGetBlob(getAdminReportsExportPath(query));
  downloadBlob(blob, getReportExportFilename(now));
}
