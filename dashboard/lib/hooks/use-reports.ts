import { useQuery, useMutation } from "@tanstack/react-query";
import { get, del, downloadFromApi } from "@/lib/api/client";

function fetchReportTypes() {
  return get("/reports/types");
}

function fetchReportData(type: string, filters?: Record<string, any>) {
  return get("/reports/data", { type, ...(filters || {}) });
}

function downloadReportExcel(type: string, filters?: Record<string, any>) {
  return downloadFromApi(`/reports/export/excel`, { query: { type, ...(filters || {}) } });
}

function downloadReportCsv(type: string, filters?: Record<string, any>) {
  return downloadFromApi(`/reports/export/csv`, { query: { type, ...(filters || {}) } });
}

function downloadReportPdf(type: string, filters?: Record<string, any>) {
  return downloadFromApi(`/reports/export/pdf`, { query: { type, ...(filters || {}) } });
}

function fetchReportTemplates() {
  return get("/report-templates");
}

function deleteReportTemplate(id: string) {
  return del(`/report-templates/${id}`);
}

function fetchAttendanceReports(filters?: Record<string, any>) {
  return get("/reports/attendance", filters || {});
}

function fetchFeeAnalytics(filters?: Record<string, any>) {
  return get("/reports/fees", filters || {});
}

function fetchAcademicReports(filters?: Record<string, any>) {
  return get("/reports/academic", filters || {});
}

function fetchSalaryReports(filters?: Record<string, any>) {
  return get("/reports/salary", filters || {});
}

export function useReportTypes() {
  return useQuery({
    queryKey: ["report-types"],
    queryFn: fetchReportTypes,
    staleTime: 5 * 60_000,
  });
}

export function useReportData(type: string, filters?: Record<string, any>, enabled = true) {
  return useQuery({
    queryKey: ["report", type, filters],
    queryFn: () => fetchReportData(type, filters),
    enabled: enabled && !!type,
    staleTime: 30_000,
  });
}

export function useAttendanceReports(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["attendance-reports", filters],
    queryFn: () => fetchAttendanceReports(filters),
    staleTime: 30_000,
  });
}

export function useFeeAnalytics(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["fee-analytics", filters],
    queryFn: () => fetchFeeAnalytics(filters),
    staleTime: 30_000,
  });
}

export function useAcademicReports(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["academic-reports", filters],
    queryFn: () => fetchAcademicReports(filters),
    staleTime: 30_000,
  });
}

export function useSalaryReports(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["salary-reports", filters],
    queryFn: () => fetchSalaryReports(filters),
    staleTime: 30_000,
  });
}

export function useDownloadReportExcel() {
  return useMutation({
    mutationFn: ({ type, filters }: { type: string; filters?: Record<string, any> }) =>
      downloadReportExcel(type, filters),
  });
}

export function useDownloadReportCsv() {
  return useMutation({
    mutationFn: ({ type, filters }: { type: string; filters?: Record<string, any> }) =>
      downloadReportCsv(type, filters),
  });
}

export function useDownloadReportPdf() {
  return useMutation({
    mutationFn: ({ type, filters }: { type: string; filters?: Record<string, any> }) =>
      downloadReportPdf(type, filters),
  });
}

export function useReportTemplates() {
  return useQuery({
    queryKey: ["report-templates"],
    queryFn: fetchReportTemplates,
    staleTime: 30_000,
  });
}
