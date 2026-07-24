import { useQuery, useMutation } from "@tanstack/react-query";
import { get, downloadFromApi } from "@/lib/api/client";

function fetchReportTypes() {
  return get("/reports/types");
}

function fetchReportData(type: string, filters?: Record<string, any>) {
  return get("/reports/data", { type, ...(filters || {}) });
}

function downloadReportExcel(type: string, filters?: Record<string, any>) {
  return downloadFromApi(`/reports/export/excel`, { method: "GET", params: { type, ...(filters || {}) } });
}

function downloadReportCsv(type: string, filters?: Record<string, any>) {
  return downloadFromApi(`/reports/export/csv`, { method: "GET", params: { type, ...(filters || {}) } });
}

function downloadReportPdf(type: string, filters?: Record<string, any>) {
  return downloadFromApi(`/reports/export/pdf`, { method: "GET", params: { type, ...(filters || {}) } });
}

function fetchReportTemplates() {
  return get("/report-templates");
}

function deleteReportTemplate(id: string) {
  return downloadFromApi(`/report-templates/${id}`, { method: "DELETE" });
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
